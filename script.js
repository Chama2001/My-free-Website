// Select DOM elements
const jokeElement = document.getElementById('joke');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const addJokeForm = document.getElementById('add-joke-form');
const newJokeInput = document.getElementById('new-joke');
const languageSelector = document.getElementById('language-selector');
const categorySelector = document.getElementById('category-selector');
const themeToggle = document.getElementById('theme-toggle');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');

let currentLanguage = 'en';
let currentCategory = 'any';
let customJokes = JSON.parse(localStorage.getItem('customJokes')) || {};
let favoriteJokes = JSON.parse(localStorage.getItem('favoriteJokes')) || [];

// Function to fetch a joke from the API
async function fetchJoke() {
  try {
    const response = await fetch(`https://v2.jokeapi.dev/joke/${currentCategory}?lang=${currentLanguage}`);
    if (!response.ok) throw new Error('Failed to fetch joke');
    const data = await response.json();

    if (data.type === 'twopart') {
      return `${data.setup} ... ${data.delivery}`;
    } else {
      return data.joke;
    }
  } catch (error) {
    console.error(error);
    return 'Oops! Failed to fetch a joke.';
  }
}

// Function to display a random joke
async function displayRandomJoke() {
  if (currentCategory === 'custom') {
    const customJokeList = customJokes[currentLanguage] || [];
    if (customJokeList.length === 0) {
      jokeElement.textContent = 'No custom jokes available. Add some!';
      return;
    }
    const randomIndex = Math.floor(Math.random() * customJokeList.length);
    jokeElement.textContent = customJokeList[randomIndex];
  } else {
    jokeElement.textContent = await fetchJoke();
  }

  jokeElement.classList.add('fade-in');
  setTimeout(() => jokeElement.classList.remove('fade-in'), 500);
}

// Event listener for the generate button
generateBtn.addEventListener('click', displayRandomJoke);

// Event listener for the copy button
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(jokeElement.textContent).then(() => {
    alert('Joke copied to clipboard!');
  }).catch((err) => {
    console.error('Failed to copy joke:', err);
  });
});

// Event listener for the favorite button
favoriteBtn.addEventListener('click', () => {
  const currentJoke = jokeElement.textContent;
  if (!favoriteJokes.includes(currentJoke)) {
    favoriteJokes.push(currentJoke);
    localStorage.setItem('favoriteJokes', JSON.stringify(favoriteJokes));
    loadFavorites();
  }
});

// Load favorite jokes into the list
function loadFavorites() {
  favoritesList.innerHTML = '';
  favoriteJokes.forEach((joke, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = joke;

    // Add a delete button for each favorite joke
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '❌';
    deleteButton.style.marginLeft = '10px';
    deleteButton.onclick = () => {
      favoriteJokes.splice(index, 1);
      localStorage.setItem('favoriteJokes', JSON.stringify(favoriteJokes));
      loadFavorites();
    };

    listItem.appendChild(deleteButton);
    favoritesList.appendChild(listItem);
  });

  favoritesSection.style.display = favoriteJokes.length > 0 ? 'block' : 'none';
}

// Event listener for the language selector
languageSelector.addEventListener('change', (event) => {
  currentLanguage = event.target.value;
  displayRandomJoke();
});

// Event listener for the category selector
categorySelector.addEventListener('change', (event) => {
  currentCategory = event.target.value;
  displayRandomJoke();
});

// Event listener for the form submission (Add Joke)
addJokeForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent page reload
  const newJoke = newJokeInput.value.trim();
  if (newJoke) {
    customJokes[currentLanguage] = customJokes[currentLanguage] || [];
    customJokes[currentLanguage].push(newJoke); // Add the new joke to the current language
    localStorage.setItem('customJokes', JSON.stringify(customJokes)); // Save to localStorage
    newJokeInput.value = ''; // Clear the input field
    displayRandomJoke(); // Display a new joke
  }
});

// Event listener for the theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.getElementById('app-container').classList.toggle('dark-mode');
  jokeElement.classList.toggle('dark-mode');
  themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Load favorites on page load
loadFavorites();

// Display a joke on page load
displayRandomJoke();