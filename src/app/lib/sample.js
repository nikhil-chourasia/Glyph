// Real tabs make the Tab size control immediately visible in the sample.
export const DEFAULT_CODE = `from collections import Counter

def summarize_languages(snippets):
\t"""Count the languages in a collection of snippets."""
\tcounts = Counter(item["language"] for item in snippets)
\tfor language, total in counts.most_common():
\t\tprint(f"{language}: {total} snippets")

snippets = [{"language": "Python"}, {"language": "JavaScript"}]
summarize_languages(snippets)`;
