// Адрес нашего Node.js API (через Docker Compose)
const API_URL = 'http://localhost:5000/api/offers';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('exhibits-container');
  if (!container) return;

  // 1. Проверяем, есть ли данные из data.js (массив exhibits)
  if (typeof exhibits === 'undefined' || !exhibits.length) {
    container.innerHTML = '<p>No exhibits found.</p>';
    return;
  }

  // 2. Рендерим каждую карточку
  for (const item of exhibits) {
    const card = document.createElement('div');
    card.className = 'exhibit-card';

    // Получаем текущую высшую ставку из базы данных (или базовую цену)
    const currentPrice = await fetchHighestOffer(item.id, item.price || 100);

    // Собираем HTML карточки (картинка, название, автор + новый блок цены)
    card.innerHTML = `
      <div class="exhibit-image-wrapper">
        <img src="${item.image}" alt="${item.title}" class="exhibit-img" />
      </div>
      <div class="exhibit-info">
        <h2>${item.title}</h2>
        <p class="author">By ${item.author || 'Unknown Artist'}</p>
        <p class="description">${item.description || ''}</p>
        
        <!-- Блок аукциона -->
        <div class="offer-section" id="offer-section-${item.id}">
          <p class="highest-offer">
            Highest Offer: $<span id="offer-amount-${item.id}">${currentPrice}</span>
          </p>
          <button class="make-offer-btn" onclick="openOfferModal('${item.id}', ${currentPrice})">
            Make an Offer
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  }
});

// --- API РАБОТА С БЭКЕНДОМ ---

// Функция получения актуальной цены с бэкенда
async function fetchHighestOffer(exhibitId, defaultPrice) {
  try {
    const res = await fetch(`${API_URL}/${exhibitId}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.amount !== null ? data.amount : defaultPrice;
  } catch (err) {
    console.warn(`Could not load offer for ${exhibitId}, using default price.`, err);
    return defaultPrice;
  }
}

// Открытие модального окна записи предложения
function openOfferModal(exhibitId, currentPrice) {
  const existingModal = document.getElementById('offer-modal');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="modal-overlay" id="offer-modal">
      <div class="modal-content">
        <h3>Make an Offer</h3>
        <p>Current Highest: <strong>$${currentPrice}</strong></p>
        <form id="offer-form">
          <label>Your Name:</label>
          <input type="text" id="offer-name" required placeholder="John Doe">
          
          <label>Contact Info (Email/Phone):</label>
          <input type="text" id="offer-contact" required placeholder="john@example.com">
          
          <label>Your Offer ($):</label>
          <input type="number" id="offer-amount-input" min="${currentPrice + 1}" required placeholder="${currentPrice + 10}">
          
          <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="closeOfferModal()">Cancel</button>
            <button type="submit" class="btn-submit">Submit Offer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Обработка отправки формы в Node.js / PostgreSQL
  document.getElementById('offer-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('offer-name').value;
    const contact = document.getElementById('offer-contact').value;
    const amount = parseFloat(document.getElementById('offer-amount-input').value);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitId, name, contact, amount })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to place offer');
        return;
      }

      // Если всё успешно — обновляем цену прямо на странице без перезагрузки
      const priceSpan = document.getElementById(`offer-amount-${exhibitId}`);
      if (priceSpan) priceSpan.innerText = amount;

      alert('Thank you! Your offer has been recorded in the database.');
      closeOfferModal();
    } catch (err) {
      console.error(err);
      alert('Server error. Make sure backend container is running.');
    }
  });
}

function closeOfferModal() {
  const modal = document.getElementById('offer-modal');
  if (modal) modal.remove();
}