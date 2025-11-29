from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

code = """
class DeveloperProfile:
    def __init__(self):
        self.name = "Jonathan Chacko"
    
    def run(self):
        print("Hello")
        
if __name__ == "__main__":
    DeveloperProfile().run()
"""

formatter = HtmlFormatter(nowrap=True)
html = highlight(code, PythonLexer(), formatter)
print(html)
