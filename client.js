const express = require('express');
const contentful = require('contentful');

const app = express();
const port = 3000;

// Init client
const client = contentful.createClient({
  space: 'knr5qdaftzxd',
  accessToken: 'aR-dvJ87HMJSybGYpl-J7kk5HOV0g7mQGp0-81zvA7w',
  environment: 'master'
});

// route home search bar
app.get('/', (req, res) => {
  const query = req.query.search || '';

  client.getEntries({
    content_type: 'project',
    'fields.title[match]': query
  })
  .then((response) => {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Portfolio</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 text-gray-900">
          <header class="bg-gray-900 text-white py-6 text-center">
            <h1 class="text-4xl font-bold">My Projects</h1>
            <p class="mt-2">Welcome!</p>
            <nav class="mt-4">
              <a href="/profile" class="text-blue-300 hover:text-blue-500 mx-2">Profile</a>
              <a href="/" class="text-blue-300 hover:text-blue-500 mx-2">Projects</a>
            </nav>
            <form method="GET" action="/" class="mt-6">
              <input type="text" name="search" placeholder="Search projects..." class="p-2 rounded border border-gray-300 text-black" value="${query}">
              <button type="submit" class="p-2 bg-blue-500 text-white rounded">Search</button>
            </form>
          </header>

          <main class="container mx-auto p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    `;

    response.items.forEach((item) => {
      const { title, shortDescription, image, gitHubLink } = item.fields;
      const imageUrl = image ? image.fields.file.url : '';

      html += `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-2">${title}</h2>
            <p class="text-gray-700 mb-4">${shortDescription}</p>
            <a href="${gitHubLink}" target="_blank" class="text-blue-600 hover:text-blue-800 font-semibold">View on GitHub</a>
          </div>
        </div>
      `;
    });

    html += `
            </div>
          </main>
          
          <footer class="bg-gray-900 text-white py-6 text-center">
            <p>&copy; ${new Date().getFullYear()} My Portfolio. All rights reserved.</p>
          </footer>
        </body>
      </html>
    `;

    res.send(html);
  })
  .catch((err) => {
    console.error('Error fetching entries:', err);
    res.status(500).send('Error fetching data');
  });
});

// Profile Route
app.get('/profile', (req, res) => {
  client.getEntries({
    content_type: 'hero'
  })
  .then(heroResponse => {
    const hero = heroResponse.items[0].fields; // count entries hero

    client.getEntries({
      content_type: 'about'
    })
    .then(aboutResponse => {
      const about = aboutResponse.items[0].fields; // count entries about

      // HTML Profile & Hero
      let html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Profile</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-100 text-gray-900">
            <header class="bg-gray-900 text-white py-6 text-center">
              <h1 class="text-4xl font-bold">Profile</h1>
              <nav class="mt-4">
                <a href="/" class="text-blue-300 hover:text-blue-500 mx-2">Home</a>
                <a href="/projects" class="text-blue-300 hover:text-blue-500 mx-2">Projects</a>
              </nav>
            </header>

            <main class="container mx-auto p-6">
              <!-- Hero Section -->
              <section class="mb-8 text-center">
                <h2 class="text-3xl font-bold">${hero.title}</h2>
                <p class="mt-4">${hero.shortDescription}</p>
                <img src="${hero.image.fields.file.url}" alt="Hero Image" class="mx-auto mt-4 w-48 h-48 object-cover rounded-full">
              </section>

              <!-- About Section -->
              <section class="text-left">
                <h2 class="text-3xl font-bold mb-4">${about.title}</h2>
                <p>${about.description}</p>
              </section>
            </main>

            <footer class="bg-gray-900 text-white py-6 text-center">
              <p>&copy; ${new Date().getFullYear()} My Portfolio. All rights reserved.</p>
            </footer>
          </body>
        </html>
      `;
      res.send(html);
    })
    .catch(err => {
      console.error('Error fetching about entry:', err);
      res.status(500).send('Error fetching about data');
    });
  })
  .catch(err => {
    console.error('Error fetching hero entry:', err);
    res.status(500).send('Error fetching hero data');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
