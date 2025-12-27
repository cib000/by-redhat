function loadFeed(feedURL) {
        document.getElementById('rssFeed').innerHTML = '';
        document.getElementById('rssFeed').style.display = 'none';
        document.getElementById('loadingIndicator').style.display = 'block';
        
        fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(feedURL))
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            const entries = xmlDoc.querySelectorAll('item, entry');
            
            let feedHTML = '';
            entries.forEach(entry => {
                const title = entry.querySelector('title').textContent;
                const link = entry.querySelector('link').textContent;
                const description = entry.querySelector('description') ? entry.querySelector('description').textContent : entry.querySelector('content').textContent;
                const img = entry.querySelector('enclosure') ? entry.querySelector('enclosure').getAttribute('url') : '';
                
                feedHTML += `
                    <div class="article">
                        <h3><a href="${link}" target="_blank">${title}</a></h3>
                        ${img ? `<img src="${img}" alt="${title}">` : ''}
                        <p>${description}</p>
						<hr><br>
                    </div>
                `;
            });
            
            document.getElementById('rssFeed').style.display = 'block';
            document.getElementById('rssFeed').innerHTML = feedHTML;
            
            document.getElementById('loadingIndicator').style.display = 'none';
        })
        .catch(error => {
            console.error(error);
            document.getElementById('loadingIndicator').style.display = 'none';
        });
    }

 document.getElementById("scrollToTopBtn").addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
 document.getElementById("scrollToTopBtn2").addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });