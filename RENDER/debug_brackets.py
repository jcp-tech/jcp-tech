from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

code = "print('hello')\nmy_list = [1, 2]\nmy_dict = {'a': 1}\nmy_tuple = (1, 2)"
formatter = HtmlFormatter(nowrap=True)
html = highlight(code, PythonLexer(), formatter)
print(html)
