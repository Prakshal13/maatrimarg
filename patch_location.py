import re

LOCATION_DATA_STR = """
const LOCATION_DATA = {
  "Maharashtra": {
    "Gadchiroli": ["Bhamragad", "Kurkheda", "Aheri", "Dhanora", "Sironcha", "Ettapalli"],
    "Nandurbar": ["Akkalkuwa", "Dhadgaon", "Navapur", "Taloda", "Shahada"],
    "Amravati": ["Dharni", "Chikhaldara", "Melghat"]
  },
  "Tamil Nadu": {
    "Nilgiris": ["Gudalur", "Pandalur", "Kotagiri", "Coonoor", "Ooty"],
    "Dharmapuri": ["Pennagaram", "Harur", "Palacode", "Pappireddipatti"]
  }
};
"""

def patch_file(filepath, comp_name):
    with open(filepath, 'r') as f:
        content = f.read()

    if "const LOCATION_DATA" not in content:
        target = f"const {comp_name} = () => {{"
        content = content.replace(target, LOCATION_DATA_STR + "\n" + target)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath} with LOCATION_DATA")

patch_file("src/pages/ChronicPortal.jsx", "ChronicPortal")
patch_file("src/pages/ChildPortal.jsx", "ChildPortal")
