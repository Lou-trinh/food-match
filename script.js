const foods = [
  {
    id: "pho-bo",
    name: "Pho bo tai",
    category: "main",
    tag: "Mon chinh",
    price: "65.000d",
    calories: "520 kcal",
    time: "12 phut",
    rating: "4.9",
    description: "Nuoc dung bo ham cham, banh pho mem, thit tai mong va rau thom tuoi. Phu hop cho bua sang hoac bua trua nhanh.",
    ingredients: ["Banh pho", "Thit bo", "Hanh la", "Rau thom", "Nuoc dung"],
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    id: "bun-cha",
    name: "Bun cha Ha Noi",
    category: "main",
    tag: "Mon chinh",
    price: "59.000d",
    calories: "610 kcal",
    time: "15 phut",
    rating: "4.8",
    description: "Cha nuong thom khoi, nuoc cham chua ngot va bun tuoi. Mon an dam vi, de an, dung chat pho co.",
    ingredients: ["Bun tuoi", "Cha nuong", "Du du", "Rau song", "Nuoc cham"],
    image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "banh-mi",
    name: "Banh mi ga xe",
    category: "snack",
    tag: "An nhe",
    price: "35.000d",
    calories: "430 kcal",
    time: "7 phut",
    rating: "4.7",
    description: "Vo banh gion, nhan ga xe mem, pate beo nhe, do chua va sot dac biet.",
    ingredients: ["Banh mi", "Ga xe", "Pate", "Do chua", "Rau mui"],
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "com-tam",
    name: "Com tam suon bi cha",
    category: "main",
    tag: "Mon chinh",
    price: "72.000d",
    calories: "780 kcal",
    time: "18 phut",
    rating: "4.9",
    description: "Suon nuong mat ong, bi thinh, cha trung va com tam nong. An kem mo hanh va nuoc mam pha.",
    ingredients: ["Com tam", "Suon nuong", "Bi", "Cha trung", "Mo hanh"],
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "goi-cuon",
    name: "Goi cuon tom thit",
    category: "snack",
    tag: "An nhe",
    price: "42.000d",
    calories: "260 kcal",
    time: "9 phut",
    rating: "4.6",
    description: "Cuon tuoi mat voi tom, thit, bun, rau song. Cham cung tuong dau phong beo thom.",
    ingredients: ["Banh trang", "Tom", "Thit heo", "Bun", "Rau song"],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ca-phe-sua",
    name: "Ca phe sua da",
    category: "drink",
    tag: "Do uong",
    price: "29.000d",
    calories: "180 kcal",
    time: "5 phut",
    rating: "4.8",
    description: "Ca phe phin dam, sua dac ngot vua, da lanh. Lua chon gon cho buoi sang tinh tao.",
    ingredients: ["Ca phe", "Sua dac", "Da vien"],
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
];

const foodList = document.querySelector("#foodList");
const featuredCard = document.querySelector("#featuredCard");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#searchInput");
const tabs = document.querySelectorAll(".tab");
const sheet = document.querySelector("#detailSheet");
const closeSheet = document.querySelector("#closeSheet");
const closeBackdrop = document.querySelector("#closeBackdrop");

let activeCategory = "all";
let searchTerm = "";

function formatCount(count) {
  return `${count} mon`;
}

function getFilteredFoods() {
  return foods.filter((food) => {
    const matchesCategory = activeCategory === "all" || food.category === activeCategory;
    const text = `${food.name} ${food.description} ${food.ingredients.join(" ")}`.toLowerCase();
    return matchesCategory && text.includes(searchTerm.toLowerCase().trim());
  });
}

function renderFeatured() {
  const food = foods.find((item) => item.featured) ?? foods[0];
  featuredCard.innerHTML = `
    <button class="featured-card" data-food-id="${food.id}">
      <img src="${food.image}" alt="${food.name}" />
      <div class="featured-card__content">
        <p class="eyebrow">De xuat hom nay</p>
        <h2>${food.name}</h2>
        <p>${food.description}</p>
        <span class="price-pill">${food.price}</span>
      </div>
    </button>
  `;
}

function renderFoods() {
  const filteredFoods = getFilteredFoods();
  resultCount.textContent = formatCount(filteredFoods.length);

  if (filteredFoods.length === 0) {
    foodList.innerHTML = `<div class="empty-state">Khong tim thay mon phu hop.</div>`;
    return;
  }

  foodList.innerHTML = filteredFoods.map((food) => `
    <button class="food-card" data-food-id="${food.id}">
      <span class="food-card__media">
        <img src="${food.image}" alt="${food.name}" loading="lazy" />
      </span>
      <span class="food-card__body">
        <h3>${food.name}</h3>
        <p>${food.description}</p>
        <span class="food-meta">
          <span>${food.time}</span>
          <span>${food.calories}</span>
        </span>
      </span>
      <span class="food-price">${food.price}</span>
    </button>
  `).join("");
}

function openDetail(foodId) {
  const food = foods.find((item) => item.id === foodId);
  if (!food) return;

  document.querySelector("#detailImage").src = food.image;
  document.querySelector("#detailImage").alt = food.name;
  document.querySelector("#detailTag").textContent = food.tag;
  document.querySelector("#detailName").textContent = food.name;
  document.querySelector("#detailPrice").textContent = food.price;
  document.querySelector("#detailDescription").textContent = food.description;
  document.querySelector("#detailCalories").textContent = food.calories;
  document.querySelector("#detailTime").textContent = food.time;
  document.querySelector("#detailRating").textContent = food.rating;
  document.querySelector("#ingredientList").innerHTML = food.ingredients
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join("");

  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDetail() {
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    activeCategory = tab.dataset.category;
    renderFoods();
  });
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderFoods();
});

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-food-id]");
  if (card) openDetail(card.dataset.foodId);
});

closeSheet.addEventListener("click", closeDetail);
closeBackdrop.addEventListener("click", closeDetail);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDetail();
});

renderFeatured();
renderFoods();
