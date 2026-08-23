import os
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

NEW_DROPDOWNS = """
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <select
                    value={newPatient.state || 'Maharashtra'}
                    onChange={(e) => {
                      const st = e.target.value;
                      const dists = Object.keys(LOCATION_DATA[st] || {});
                      const firstDist = dists.length > 0 ? dists[0] : '';
                      const vils = LOCATION_DATA[st][firstDist] || [];
                      const firstVil = vils.length > 0 ? vils[0] : '';
                      setNewPatient({ ...newPatient, state: st, district: firstDist, village: firstVil });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {Object.keys(LOCATION_DATA).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <select
                    value={newPatient.district || 'Gadchiroli'}
                    onChange={(e) => {
                      const dist = e.target.value;
                      const vils = LOCATION_DATA[newPatient.state || 'Maharashtra'][dist] || [];
                      const firstVil = vils.length > 0 ? vils[0] : '';
                      setNewPatient({ ...newPatient, district: dist, village: firstVil });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {Object.keys(LOCATION_DATA[newPatient.state || 'Maharashtra'] || {}).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('village_ward')}</label>
                <select
                  required
                  value={newPatient.village || 'Bhamragad'}
                  onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  {(LOCATION_DATA[newPatient.state || 'Maharashtra']?.[newPatient.district || 'Gadchiroli'] || []).map(vil => (
                    <option key={vil} value={vil}>{vil}</option>
                  ))}
                </select>
              </div>
"""

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Inject LOCATION_DATA
    if "const LOCATION_DATA" not in content:
        content = content.replace("const App = () => {", LOCATION_DATA_STR + "\nconst App = () => {")
        content = content.replace("const ChronicPortal = () => {", LOCATION_DATA_STR + "\nconst ChronicPortal = () => {")
        content = content.replace("const ChildPortal = () => {", LOCATION_DATA_STR + "\nconst ChildPortal = () => {")

    # Replace newPatient village field text input with NEW_DROPDOWNS
    village_input_regex = re.compile(r"""<div>\s*<label[^>]*>\{t\('village_ward'\)\}</label>\s*<input\s*type="text"\s*required\s*value=\{newPatient\.village\}[^>]*>\s*</div>""", re.DOTALL)
    
    if village_input_regex.search(content):
        content = village_input_regex.sub(NEW_DROPDOWNS.strip(), content)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Could not find village input block in {filepath}")

patch_file("src/pages/ChronicPortal.jsx")
patch_file("src/pages/ChildPortal.jsx")
