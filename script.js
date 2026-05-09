

// Get the form and result elements
const searchInput = document.getElementById('search-input');
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

// Fetch user data and repositories from GitHub API
// This function is called when the user clicks the search button or presses Enter in the input field
// It uses the fetchGithubJson function to get the user data and repositories, and then calls renderProfile to 
// display the results. If there's an error (e.g., user not found), it catches the error and calls renderMessage to display the error message to the user.
async function fetchuserData(username) {
    try {
        const user = await fetchGithubJson(`https://api.github.com/users/${username}`);
        const repositories = await fetchGithubJson(`https://api.github.com/users/${username}/repos`);

        //fetch the README file for the user (if it exists) and include it in the profile rendering
        let readme = null;
        try {
            readme = await fetchGithubJson(`https://api.github.com/repos/${username}/${username}/readme`);
        } catch (error) {
            // Ignore README fetch errors
        }

        renderProfile(user, repositories, readme);
    } catch (error) {
        renderMessage('Error', error.message);
    }
}

// Event listener for the search button click
// When the search button is clicked, it gets the username from the input field, trims any whitespace, 
// and checks if it's not empty. If a username is provided, it calls fetchuserData to get and displays 
// the user's profile and repositories. 
// If the input is empty, it calls renderMessage to display an error message prompting the user to enter a GitHub username.
searchBtn.addEventListener('click', () => {
    const username = searchInput.value.trim();  
    if (username) {
        fetchuserData(username);
    }   else {      
        renderMessage('Input Error', 'Please enter a GitHub username.');
    }
});

// Event listener for the Enter key press in the input field
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
}); 


// Render a message card with a title and message. This is used to display error messages or other information to the user.
function renderMessage(title, message) {
  results.innerHTML = `
    <article class="message-card">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
    </article>
  `;
}

// Render the user's profile and their repositories. This function takes the user data and an array of repositories,
// and generates HTML to display the user's avatar, name, bio, stats (repos, followers, following), and a list of their public repositories with links to each repository on GitHub.
function renderProfile(user, repositories, readme) {
  const repoItems = repositories.map((repo) => `
    <article class="repo-card">
      <div>
        <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a></h3>
        <p>${escapeHtml(repo.description || 'No description provided.')}</p>
      </div>
      <div class="repo-meta">
        <span>${escapeHtml(repo.language || 'Unknown')}</span>
        <span>${formatNumber(repo.stargazers_count)} stars</span>
      </div>
    </article>
  `).join('');

// If the user has a profile README, we parse it from Markdown to HTML using the marked library. 
// If not, we display a message indicating that there is no profile README.  
//used atob() but it cant handle UTF-8 characters- it only decodes ASCII characters, 
// so if the README contains non-ASCII characters (like emojis or characters from non-Latin scripts), 
// it messes up the readme file.

/* const readmeHtml = readme
   ? marked.parse(atob(readme.content))
    : '<p class="empty-state">This user has no profile README.</p>';  
*/

// to handle this: we can decode the base64 content to a UTF-8 string by first converting the 
// base64 string to a binary string,
const readmeHtml = readme
  ? marked.parse(decodeURIComponent(atob(readme.content).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')))
  : '<p class="empty-state">This user has no profile README.</p>';

  results.innerHTML = `
    <section class="profile-card">
      <img src="${user.avatar_url}" alt="${escapeHtml(user.login)} avatar" class="profile-avatar" />
      <div class="profile-copy">
        <p class="profile-label">@${escapeHtml(user.login)}</p>
        <h2>${escapeHtml(user.name || user.login)}</h2>
        <p>${escapeHtml(user.bio || 'No bio available.')}</p>
        <p>>${escapeHtml(user.location || 'Location not specified.')}</p>  
        <div class="stats-grid">
          <div><strong>${formatNumber(user.public_repos)}</strong><span>Repos</span></div>
          <div><strong>${formatNumber(user.followers)}</strong><span>Followers</span></div>
          <div><strong>${formatNumber(user.following)}</strong><span>Following</span></div>
        </div>
        <a class="profile-link" href="${user.html_url}" target="_blank" rel="noreferrer">Open GitHub profile</a>
      </div>
    </section>

    <section class="readme-card">
      <h3>README</h3>
      <div class="readme-content">${readmeHtml}</div>
    </section>


    <section class="repo-grid">
      ${repoItems || '<p class="empty-state">No public repositories found.</p>'}
    </section>
  `;
};
