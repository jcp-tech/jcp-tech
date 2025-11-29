from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

code = "# This is a comment"
formatter = HtmlFormatter(nowrap=True)
html = highlight(code, PythonLexer(), formatter)
print(html)
