import os

# Run this code to get JCP-TECH's developer profile!
print("DUMMY TESTING OUTPUT -> ", len([]))

for i in range(2):
    print(i)

class DeveloperProfile:
    def __init__(self):
        self.name = "Jonathan Chacko"
        self.role = "AI / Automation Developer"

    def run(self):
        print('Initializing f"Developer[] Profile...\n')
        print(f"Name   : {self.name}")
        print(f"Role   : {self.role}")
        print("\nStatus : {} ACT()IVE")

if __name__ == "__main__":
    DeveloperProfile().run()
