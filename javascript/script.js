// Available card suits and ranks
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;

// Load scoreboard from localStorage if exists, otherwise set to 0
let wins = parseInt(localStorage.getItem("wins")) || 0;
let losses = parseInt(localStorage.getItem("losses")) || 0;
let draws = parseInt(localStorage.getItem("draws")) || 0;

// Update scoreboard UI + save values to localStorage
function updateScoreboard() {
    document.getElementById("wins").textContent = wins;
    document.getElementById("losses").textContent = losses;
    document.getElementById("draws").textContent = draws;

    localStorage.setItem("wins", wins);
    localStorage.setItem("losses", losses);
    localStorage.setItem("draws", draws);
}

// Initial update
updateScoreboard();

// Create full 52-card deck
function createDeck() {
    deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });
}

// Shuffle deck using Fisher–Yates algorithm
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Get numeric value of a card
function getCardValue(card) {
    if (card.rank === "A") return 11;         // Aces are 11 (later adjusted)
    if (["K", "Q", "J"].includes(card.rank)) return 10;
    return parseInt(card.rank);
}

// Calculate total hand value + adjust for Aces
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
        value += getCardValue(card);
        if (card.rank === 'A') aces++;        // Count number of Aces
    });

    // If value > 21 and we have Aces counted as 11 → convert them to 1
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

// Display cards in the given container (hide dealer's first card initially)
function renderHand(hand, elementId, hideFirst = false) {
    const container = document.getElementById(elementId);
    container.innerHTML = ""; // Clear previous cards

    hand.forEach((card, index) => {
        const el = document.createElement("div");
        el.className = "card";

        if (hideFirst && index === 0) {
            el.classList.add("hidden");
            el.textContent = "?"; // Face-down card
        } else {
            el.innerHTML = `<div>${card.rank}</div><div>${card.suit}</div>`;
        }

        container.appendChild(el);
    });
}

// Draw a card from the deck and add it to a hand
function dealCard(hand) {
    hand.push(deck.pop());
}

// Start a new game
function startGame() {
    createDeck();
    shuffleDeck();

    playerHand = [];
    dealerHand = [];
    gameOver = false;

    // Deal opening cards
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);

    // Render hands (dealer first card hidden)
    renderHand(dealerHand, "dealer-hand", true);
    renderHand(playerHand, "player-hand");

    // Initial message
    document.getElementById("message").textContent =
        `Player: ${calculateHandValue(playerHand)} | Dealer: ?`;

    document.getElementById("hit").disabled = false;
    document.getElementById("stand").disabled = false;
}

// Player draws a card
function hit() {
    if (gameOver) return;

    dealCard(playerHand);
    renderHand(playerHand, "player-hand");

    const value = calculateHandValue(playerHand);

    // Player busts
    if (value > 21) {
        document.getElementById("message").textContent = `Bust! You lose. (${value})`;
        losses++;
        updateScoreboard();
        endGame();
    } else {
        document.getElementById("message").textContent =
            `Player: ${value} | Dealer: ?`;
    }
}

// Player ends their turn
function stand() {
    if (gameOver) return;

    // Reveal dealer's full hand
    renderHand(dealerHand, "dealer-hand");

    // Dealer must hit until reaching at least 17
    let dealerValue = calculateHandValue(dealerHand);
    while (dealerValue < 17) {
        dealCard(dealerHand);
        dealerValue = calculateHandValue(dealerHand);
    }

    renderHand(dealerHand, "dealer-hand");

    const playerValue = calculateHandValue(playerHand);
    let result = "";

    // Determine winner
    if (dealerValue > 21) {
        result = "Dealer busts! You win!";
        wins++;
    } else if (playerValue > dealerValue) {
        result = "You win!";
        wins++;
    } else if (playerValue < dealerValue) {
        result = "You lose!";
        losses++;
    } else {
        result = "Draw!";
        draws++;
    }

    updateScoreboard();

    document.getElementById("message").textContent =
        `${result} Player: ${playerValue} | Dealer: ${dealerValue}`;

    endGame();
}

// Disable buttons after game ends
function endGame() {
    gameOver = true;
    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
}

// Button event listeners
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("new-game").addEventListener("click", startGame);
