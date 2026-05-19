// Get the form and result elements
const searchInput1 = document.getElementById('search-input1');
const searchInput2 = document.getElementById('search-input2');
const searchBtn = document.getElementById('search-btn');
const results = document.getElementById('results');

async function fetchGithubJson(url) {
    const response = await fetch(url);
    const data = await response.json();

    // Check if the response is not ok (e.g., 404 or 500)
    // If it's not ok, throw an error with the message from the API or a default message
    // This will allow us to catch the error in the calling function and display it to the user
    if (!response.ok){
        throw new Error(data.message || 'Error fetching data');
    }
    return data;
}

// Format numbers with commas for thousands
function formatNumber(value) {
  return new Intl.NumberFormat('en').format(value);
}
// Escape HTML special characters to prevent XSS attacks
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Fetch user data and repositories from GitHub API for both users
// This function is called when the user clicks the compare button or presses Enter in either input field
// It uses the fetchGithubJson function to get the user data and repositories for both users, and then calls renderComparison to display the results. If there's an error (e.g., user not found), it catches the error and calls renderMessage to display the error message to the user.
async function fetchComparisonData(username1, username2) {
    try {
        const [user1, user2] = await Promise.all([
            fetchGithubJson(`https://api.github.com/users/${username1}`),
            fetchGithubJson(`https://api.github.com/users/${username2}`)
        ]);
        const [repos1, repos2] = await Promise.all([
            fetchGithubJson(`https://api.github.com/users/${username1}/repos?per_page=100`),
            fetchGithubJson(`https://api.github.com/users/${username2}/repos?per_page=100`)
        ]);
        renderComparison(user1, repos1, user2, repos2);
    }  catch (error) {
        renderMessage('Error', error.message);
    }
}

// Event listener for the compare button click
// When the compare button is clicked, it gets the usernames from the input fields, trims any whitespace, and calls fetchComparisonData to get the data for both users and display the comparison results.
searchBtn.addEventListener('click', () => {
    const username1 = searchInput1.value.trim();
    const username2 = searchInput2.value.trim();
    if (username1 && username2) {
    fetchComparisonData(username1, username2);
} else {
    renderMessage('Error', 'Please enter both usernames.');
}
});  


function renderMessage(title, message) {
  results.innerHTML = `
    <article class="message-card">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
    </article>
  `;
}

function getTotalStars(repos) {
  return repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
}

function getTotalForks(repos) {
  return repos.reduce((sum, repo) => sum + repo.forks_count, 0);
}

function getTopLanguage(repos) {
  const tally = {};
  repos.forEach(repo => {
    if (repo.language) tally[repo.language] = (tally[repo.language] || 0) + 1;
  });
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function getMostStarredRepo(repos) {
  return repos.reduce((top, repo) => 
    repo.stargazers_count > (top?.stargazers_count || 0) ? repo : top, null);
}

function getAccountAge(createdAt) {
  const years = ((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  return `${years} yrs`;
}

function renderComparison(user1, repos1, user2, repos2) {
  const stars1 = getTotalStars(repos1);
  const stars2 = getTotalStars(repos2);
  const forks1 = getTotalForks(repos1);
  const forks2 = getTotalForks(repos2);
  const best1  = getMostStarredRepo(repos1);
  const best2  = getMostStarredRepo(repos2);

  // winner() returns CSS class — green for higher, muted for lower
  const winner = (a, b) => a >= b ? 'stat-higher' : 'stat-lower';

  results.innerHTML = `
    <!-- Side by side profile cards -->
    <div class="compare-grid">
      <section class="compare-col profile-card">
        <img src="${user1.avatar_url}" alt="${escapeHtml(user1.login)}" class="profile-avatar"/>
        <div class="profile-copy">
          <p class="profile-label">@${escapeHtml(user1.login)}</p>
          <h2>${escapeHtml(user1.name || user1.login)}</h2>
          <p>${escapeHtml(user1.bio || 'No bio available.')}</p>
          <a class="profile-link" href="${user1.html_url}" target="_blank">Open GitHub profile</a>
        </div>
      </section>

      <section class="compare-col profile-card">
        <img src="${user2.avatar_url}" alt="${escapeHtml(user2.login)}" class="profile-avatar"/>
        <div class="profile-copy">
          <p class="profile-label">@${escapeHtml(user2.login)}</p>
          <h2>${escapeHtml(user2.name || user2.login)}</h2>
          <p>${escapeHtml(user2.bio || 'No bio available.')}</p>
          <a class="profile-link" href="${user2.html_url}" target="_blank">Open GitHub profile</a>
        </div>
      </section>
    </div>

    <!-- Head to head stats -->
    <div class="compare-stats-row">
      <span class="${winner(user1.public_repos, user2.public_repos)} compare-stat-left">${formatNumber(user1.public_repos)}</span>
      <span class="compare-stat-label">Public Repos</span>
      <span class="${winner(user2.public_repos, user1.public_repos)} compare-stat-right">${formatNumber(user2.public_repos)}</span>

      <span class="${winner(user1.followers, user2.followers)} compare-stat-left">${formatNumber(user1.followers)}</span>
      <span class="compare-stat-label">Followers</span>
      <span class="${winner(user2.followers, user1.followers)} compare-stat-right">${formatNumber(user2.followers)}</span>

      <span class="${winner(stars1, stars2)} compare-stat-left">${formatNumber(stars1)}</span>
      <span class="compare-stat-label">Total Stars</span>
      <span class="${winner(stars2, stars1)} compare-stat-right">${formatNumber(stars2)}</span>

      <span class="${winner(forks1, forks2)} compare-stat-left">${formatNumber(forks1)}</span>
      <span class="compare-stat-label">Total Forks</span>
      <span class="${winner(forks2, forks1)} compare-stat-right">${formatNumber(forks2)}</span>

      <span class="compare-stat-left">${getTopLanguage(repos1)}</span>
      <span class="compare-stat-label">Top Language</span>
      <span class="compare-stat-right">${getTopLanguage(repos2)}</span>

      <span class="compare-stat-left">${getAccountAge(user1.created_at)}</span>
      <span class="compare-stat-label">Account Age</span>
      <span class="compare-stat-right">${getAccountAge(user2.created_at)}</span>

      <span class="compare-stat-left">${best1 ? escapeHtml(best1.name) : 'N/A'}</span>
      <span class="compare-stat-label">Best Repo</span>
      <span class="compare-stat-right">${best2 ? escapeHtml(best2.name) : 'N/A'}</span>
    </div>
  `;
}

[searchInput1, searchInput2].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
});
    