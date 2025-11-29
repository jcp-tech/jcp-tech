# Run this code to get JCP-TECH's developer profile!
class DeveloperProfile:
    def __init__(self):
        self.name = "Jonathan Chacko"
        self.role = "AI / Automation Developer"

    def run(self):
        print("Initializing Developer Profile...\n")
        print(f"Name   : {self.name}")
        print(f"Role   : {self.role}")
        print("\nStatus : ACTIVE")

if __name__ == "__main__":
    DeveloperProfile().run()
