import html
import http.server
import io
import json
import os
import re
import sys
import time
import urllib
from http import HTTPStatus

# Serve content and emulate the GitHub Content API
#
# While implementing this, I referenced the following sources:
#  * https://wiki.python.org/moin/BaseHttpServer
#  * https://docs.python.org/3/library/http.server.html
#  * https://docs.python.org/3/library/json.html
#  * https://developer.github.com/v3/repos/contents/
#  * https://stackoverflow.com/a/53218452

PORT = 8080
BIND_ADDRESS = '127.0.0.1'

class GitHubContentApiEmulationHandler(http.server.SimpleHTTPRequestHandler):

    """
    HTTP handler that emulates the GitHub Contents API (https://developer.github.com/v3/repos/contents/)

    When it receives a request with the header "X-GitHub-Content" then it tries to emulate the the behavior of the
    GitHub Content API. If this header is *not* present, then the handler delegates to a
    http.server.SimpleHTTPRequestHandler
    """

    def do_GET(self):
        GITHUB_CONTENT_API_REGEX = "/repos/.*/.*/contents/(.*)"
        pattern = re.compile(GITHUB_CONTENT_API_REGEX)
        match = pattern.match(self.path)
        if match:
            print("Detected a request for the GitHub Content API from request path %s" % self.path)
            resource = match.group(1)
            print("TODO return emulated response of the GitHub Content API for the directory '%s'" % resource)
            self.github_content(resource)
        else:
            http.server.SimpleHTTPRequestHandler.do_GET(self)

    def send_no_cache_headers(self):

        """
        Send Headers to signal that the client should *not* cache this request. This is useful for local development
        when we don't want to cache, for example, the CSS files while we are rapidly prototyping.

        Gotten from the excellent suggestion https://stackoverflow.com/a/25708957
        """


        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def github_content(self, resource):
        path = self.translate_path(resource)
        f = None
        if os.path.isdir(path):
            # print("TODO")
            f = self.list_directory_json(path)
        else:
            print("Expected to find a directory but '%s' is not a directory" % self.path)
        try:
            self.copyfile(f, self.wfile)
        finally:
            f.close()

    def list_directory_json(self, path):
        """Helper to produce a directory listing in JSON form.

        Mostly copied from the excellent http.server.SimpleHTTPRequestHandler#list_directory but instead of returning
        HTML it returns JSON

        """
        try:
            list = os.listdir(path)
        except OSError:
            self.send_error(
                HTTPStatus.NOT_FOUND,
                "No permission to list directory")
            return None
        list.sort(key=lambda a: a.lower())
        r = []
        try:
            displaypath = urllib.parse.unquote(self.path,
                                               errors='surrogatepass')
        except UnicodeDecodeError:
            displaypath = urllib.parse.unquote(path)
        displaypath = html.escape(displaypath, quote=False)
        enc = sys.getfilesystemencoding()
        for name in list:
            fullname = os.path.join(path, name)
            displayname = name
            type = "file"
            # Append / for directories
            if os.path.isdir(fullname):
                displayname = name + "/"
                type = "dir"
            r.append({"name": displayname, "type": type, "path": name})
        content = json.dumps(r)
        encoded = content.encode(enc, 'surrogateescape')
        f = io.BytesIO()
        f.write(encoded)
        f.seek(0)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=%s" % enc)
        self.send_header("Content-Length", str(len(encoded)))
        self.send_no_cache_headers()
        self.end_headers()
        return f


httpd = http.server.HTTPServer((BIND_ADDRESS, PORT), GitHubContentApiEmulationHandler)
print("Serving at http://%s:%s !" % (BIND_ADDRESS, PORT))
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()
print("Server Stopped at %s" % (time.asctime()))
