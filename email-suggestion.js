class EmailSuggestion extends HTMLElement {
	static tagName = "email-suggestion";

	connectedCallback() {
		const domains = this.dataset.domains;
		if (!domains) {
			return console.warn(
				`No suggestion domains were provided on ${this.localName} element.`
			);
		}

		this.domains = domains.toLowerCase().split(",");

		const suggestion = this.dataset.suggestion;
		if (suggestion) {
			this.suggestion = suggestion;
		}

		this.input = this.querySelector("input[type=email]");
		if (!this.input) {
			return;
		}

		const form = this.closest("form");
		if (!form) {
			return;
		}

		form.addEventListener("formdata", this.showSuggestionPrompt);
	}

	showSuggestionPrompt = (event) => {
		const formData = event.formData;
		const email = this.input.value;
		const parts = email.split("@");
		const domain = parts[1]?.toLowerCase();
		if (!domain) {
			return;
		}

		const closestDomain = suggestSimilarDomain(email, this.domains);
		if (!closestDomain) {
			return;
		}

		const newEmail = `${parts[0]}@${closestDomain}`;
		const prompt = (this.suggestion || "Did you mean %email%?").replace(
			"%email%",
			newEmail
		);

		if (confirm(prompt)) {
			formData.set(this.input.getAttribute("name"), newEmail);
			this.input.value = newEmail;
		}
	};
}

if ("customElements" in window) {
	customElements.define(EmailSuggestion.tagName, EmailSuggestion);
}

/**
 * Calculates the Levenshtein distance between two strings.
 * @link https://stackoverflow.com/questions/460070/detecting-mistyped-email-addresses-in-javascript
 *
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @return {number} The Levenshtein distance between the two strings.
 */
function getLevenshteinDistance(str1, str2) {
	const [s1, s2] = [str1, str2].sort((a, b) => b.length - a.length); // Ensure shorter string is first
	const distances = new Array(s1.length + 1)
		.fill(null)
		.map(() => new Array(s2.length + 1).fill(null));

	// Base cases: empty strings have distance equal to their length
	for (let i = 0; i <= s1.length; i++) {
		distances[i][0] = i;
	}

	for (let j = 0; j <= s2.length; j++) {
		distances[0][j] = j;
	}

	// Calculate Levenshtein distance for each character
	for (let i = 1; i <= s1.length; i++) {
		for (let j = 1; j <= s2.length; j++) {
			const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
			distances[i][j] = Math.min(
				distances[i - 1][j] + 1, // Insertion
				distances[i][j - 1] + 1, // Deletion
				distances[i - 1][j - 1] + cost // Substitution
			);
		}
	}

	return distances[s1.length][s2.length];
}

/**
 * Returns the domain from the given email that has the smallest Levenshtein distance to the domains in the provided list.
 *
 * @param {string} email - The email to extract the domain from.
 * @param {string[]} - The list of domains to compare against. Defaults to EMAIL_PROVIDERS.
 * @param {number} [threshold=3] - The maximum Levenshtein distance allowed for a match. Defaults to 3.
 * @return {string | null} - The closest matching domain, or null if no domain is found or the email is invalid.
 */
export function suggestSimilarDomain(email, domains, threshold = 3) {
	const parts = email.split("@");
	const domain = parts[1]?.toLowerCase(); // Handle potential absence of domain part

	if (!domain) {
		return null; // No domain provided
	}

	if (domains.includes(domain.toLowerCase())) {
		return null;
	}

	let closestDomain = null;
	let minDistance = Infinity;

	for (const knownDomain of domains) {
		const distance = getLevenshteinDistance(domain, knownDomain.toLowerCase());
		if (distance < minDistance && distance <= threshold) {
			minDistance = distance;
			closestDomain = knownDomain;
		}
	}

	return closestDomain;
}
