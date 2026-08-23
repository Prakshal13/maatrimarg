with open('src/pages/ChronicPortal.jsx', 'r') as f:
    content = f.read()

bad_block = """              <div>
              <div className="grid grid-cols-2 gap-3">"""

good_block = """              <div className="grid grid-cols-2 gap-3">"""

content = content.replace(bad_block, good_block)

with open('src/pages/ChronicPortal.jsx', 'w') as f:
    f.write(content)
