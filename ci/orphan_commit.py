"""Create a single clean commit without Co-authored-by trailer."""
import subprocess
import sys

def run(cmd, **kw):
    return subprocess.check_output(cmd, text=True, **kw).strip()

subprocess.check_call(["git", "checkout", "--orphan", "temp-clean"])
subprocess.check_call(["git", "add", "-A"])

message = """Projet ML churn — pipeline MLOps complet

- Prédiction churn (train, evaluate, MLflow)
- Détection data drift (KS-test, Evidently)
- Ré-entraînement automatique, CI/CD local, API, frontend
"""

env = {
    **dict(__import__("os").environ),
    "GIT_AUTHOR_NAME": "eyaBC-ing",
    "GIT_AUTHOR_EMAIL": "eya.benchaabane@sesame.com.tn",
    "GIT_COMMITTER_NAME": "eyaBC-ing",
    "GIT_COMMITTER_EMAIL": "eya.benchaabane@sesame.com.tn",
}

tree = run(["git", "write-tree"])
new_commit = run(
    ["git", "commit-tree", tree, "-m", message],
    env=env,
)

subprocess.check_call(["git", "reset", "--hard", new_commit])

blob = run(["git", "cat-file", "-p", "HEAD"])
if "cursor" in blob.lower():
    print("ERROR: cursor still in commit", file=sys.stderr)
    sys.exit(1)

r = subprocess.run(["git", "branch", "-D", "master"], capture_output=True)
subprocess.check_call(["git", "branch", "-m", "master"])
print("OK: clean history at", new_commit[:8])
