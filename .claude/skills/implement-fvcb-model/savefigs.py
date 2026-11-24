"""Run an exported validation notebook headless; save each figure as figs/<id>.svg."""
import json, sys
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

nb_path, out_dir, *ids = sys.argv[1:]
out = Path(out_dir); out.mkdir(exist_ok=True)
queue = list(ids)
def show(*_a, **_k):
    plt.gcf().savefig(out / f"{queue.pop(0)}.svg"); plt.close("all")
plt.show = show
ns = {"__name__": "__main__"}
for c in json.loads(Path(nb_path).read_text())["cells"]:
    if c["cell_type"] == "code":
        src = c["source"]; exec("".join(src) if isinstance(src, list) else src, ns)
assert not queue, queue
