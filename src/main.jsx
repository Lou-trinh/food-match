import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ChevronDown, Flame, GlassWater, RotateCcw, Search, Shuffle, Star, Utensils, X } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function imgSrc(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return API_URL + path;
  return path;
}

const mealFilters = [
  { id: "all", label: "Tất cả", hint: "" },
  { id: "sáng", label: "Sáng", hint: "nhanh gọn" },
  { id: "trưa", label: "Trưa", hint: "no bụng" },
  { id: "tối", label: "Tối", hint: "ấm cúng" },
];

const drinkFilters = [
  { id: "all",          label: "Tất cả",      hint: "" },
  { id: "cà phê việt", label: "Cà phê Việt", hint: "truyền thống" },
  { id: "cà phê máy",  label: "Cà phê máy",  hint: "espresso" },
  { id: "trà",         label: "Trà",          hint: "thanh mát" },
  { id: "nước ép",     label: "Nước ép",      hint: "tươi mát" },
  { id: "sữa chua",    label: "Sữa chua",     hint: "mát lạnh" },
  { id: "matcha",      label: "Matcha",        hint: "thuần Nhật" },
  { id: "sinh tố",     label: "Sinh tố",      hint: "bổ dưỡng" },
];

function currency(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function foodMatchesMeal(food, meal) {
  if (meal === "all") return true;
  return food.tag.toLowerCase().includes(meal);
}

function App() {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/foods`).then(r => r.json()).then(setFoods).catch(() => {});
    fetch(`${API_URL}/api/drinks`).then(r => r.json()).then(setDrinks).catch(() => {});
  }, []);

  const [page, setPage] = useState("food");
  const [meal, setMeal] = useState("all");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveMode, setLeaveMode] = useState("drag");
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isLikedOpen, setIsLikedOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleTransDur, setShuffleTransDur] = useState(200);
  const startPoint = useRef(null);

  const activeData = page === "food" ? foods : drinks;
  const activeFilters = (page === "food" ? mealFilters : drinkFilters).map((f, i) =>
    i === 0 ? { ...f, hint: `${activeData.length} ${page === "food" ? "món" : "loại"}` } : f
  );

  const deckFoods = useMemo(() => {
    const data = page === "food" ? foods : drinks;
    const q = search.trim().toLowerCase();
    return data.filter((food) => {
      if (!foodMatchesMeal(food, meal)) return false;
      if (q) return food.name.toLowerCase().includes(q);
      return true;
    });
  }, [page, meal, search]);
  const currentFood = deckFoods[index];
  const nextFood = deckFoods[index + 1];
  const decision = drag.x > 55 ? "like" : drag.x < -55 ? "skip" : null;
  const likedForMeal = liked.filter((food) => foodMatchesMeal(food, meal));
  const skippedForMeal = skipped.filter((food) => foodMatchesMeal(food, meal));

  useEffect(() => {
    const upcomingFoods = deckFoods.slice(index, index + 12);
    upcomingFoods.forEach((food) => {
      const image = new Image();
      image.src = food.image;
    });
  }, [deckFoods, index]);

  function changePage(newPage) {
    if (newPage === page) return;
    setPage(newPage);
    setMeal("all");
    setSearch("");
    setIndex(0);
    setLiked([]);
    setSkipped([]);
    setDrag({ x: 0, y: 0, active: false });
    setIsLeaving(false);
    setIsAdvancing(false);
    setIsLikedOpen(false);
    setIsShuffling(false);
  }

  function changeMeal(nextMeal) {
    setMeal(nextMeal);
    setSearch("");
    setIndex(0);
    setDrag({ x: 0, y: 0, active: false });
    setIsLeaving(false);
    setIsAdvancing(false);
    setIsLikedOpen(false);
  }

  function handleSearch(value) {
    setSearch(value);
    setIndex(0);
    setDrag({ x: 0, y: 0, active: false });
    setIsLeaving(false);
    setIsAdvancing(false);
  }

  function finishSwipe(type, mode = "drag") {
    if (!currentFood || isLeaving) return;

    if (type === "like") setLiked((items) => [...items, currentFood]);
    if (type === "skip") setSkipped((items) => [...items, currentFood]);

    setLeaveMode(mode);
    setIsLeaving(true);
    setIsAdvancing(true);
    const distance = mode === "button" ? 520 : 720;
    const yOffset = mode === "button" ? -28 : drag.y * 0.25;
    setDrag({ x: type === "like" ? distance : -distance, y: yOffset, active: false });
    window.setTimeout(() => {
      setIndex((value) => value + 1);
      setDrag({ x: 0, y: 0, active: false });
      setIsLeaving(false);
      window.setTimeout(() => setIsAdvancing(false), 60);
    }, mode === "button" ? 680 : 420);
  }

  function handleRandom() {
    if (!deckFoods.length || isShuffling || isLeaving) return;

    const deckLen = deckFoods.length;
    const targetIdx = Math.floor(Math.random() * deckLen);
    const count = Math.min(7, Math.max(3, Math.floor(deckLen / 2)));
    const durations =  [130, 170, 220, 290, 390, 520, 680].slice(0, count);
    const timeouts =   [175, 215, 270, 350, 470, 625, 810].slice(0, count);

    setIsShuffling(true);
    let step = 0;
    let dir = 1;

    function runStep() {
      if (step >= count) {
        setIndex(targetIdx);
        setDrag({ x: 0, y: 0, active: false });
        setIsLeaving(false);
        setIsAdvancing(false);
        window.setTimeout(() => setIsShuffling(false), 350);
        return;
      }
      setShuffleTransDur(durations[step]);
      setLeaveMode("shuffle");
      setIsLeaving(true);
      setIsAdvancing(true);
      setDrag({ x: dir * 520, y: -18, active: false });
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % deckLen);
        setDrag({ x: 0, y: 0, active: false });
        setIsLeaving(false);
        window.setTimeout(() => {
          setIsAdvancing(false);
          step++;
          dir = -dir;
          runStep();
        }, 55);
      }, timeouts[step]);
    }

    runStep();
  }

  function resetDeck() {
    setIndex(0);
    setSearch("");
    setLiked([]);
    setSkipped([]);
    setDrag({ x: 0, y: 0, active: false });
    setIsLeaving(false);
    setIsAdvancing(false);
    setIsLikedOpen(false);
  }

  function onPointerDown(event) {
    if (!currentFood || isLeaving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startPoint.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(event) {
    if (!startPoint.current || !currentFood || isLeaving) return;
    setDrag({
      x: event.clientX - startPoint.current.x,
      y: event.clientY - startPoint.current.y,
      active: true,
    });
  }

  function onPointerUp() {
    if (!startPoint.current) return;
    const type = drag.x > 110 ? "like" : drag.x < -110 ? "skip" : null;
    startPoint.current = null;

    if (type) {
      finishSwipe(type);
      return;
    }

    setDrag({ x: 0, y: 0, active: false });
  }

  return (
    <main className="app">
      <div className="page-switcher">
        <button className={page === "food" ? "is-active" : ""} onClick={() => changePage("food")}>
          <Utensils size={15} />
          Đồ ăn
        </button>
        <button className={page === "drink" ? "is-active" : ""} onClick={() => changePage("drink")}>
          <GlassWater size={15} />
          Đồ uống
        </button>
      </div>

      <header className="hero">
        <div className="brand-row">
          <span className="brand-mark">
            <Utensils size={18} />
          </span>
          <div>
            <p>{page === "food" ? "Vietnam Food Match" : "Vietnam Drink Match"}</p>
            <h1>{page === "food" ? "Quẹt để chọn món Việt hôm nay" : "Quẹt để chọn đồ uống hôm nay"}</h1>
          </div>
        </div>

        <div className="stats-row">
          <span>
            <strong>{deckFoods.length}</strong>
            món phù hợp
          </span>
          <span>
            <strong>{likedForMeal.length}</strong>
            món đã thích
          </span>
          <span>
            <strong>{Math.min(index + 1, deckFoods.length)}</strong>
            đang xem
          </span>
        </div>
      </header>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {search && (
          <button className="search-bar__clear" onClick={() => handleSearch("")}>
            <X size={13} />
          </button>
        )}
      </div>

      <nav className={`meal-tabs${activeFilters.length > 4 ? " meal-tabs--scroll" : ""}`} aria-label="Lọc theo bữa ăn">
        {activeFilters.map((item) => (
          <button
            key={item.id}
            className={meal === item.id ? "is-active" : ""}
            onClick={() => changeMeal(item.id)}
          >
            <strong>{item.label}</strong>
            <small>{item.hint}</small>
          </button>
        ))}
      </nav>

      <section
        className={`deck ${isAdvancing ? "is-advancing" : ""} ${isLeaving && leaveMode === "button" ? "button-leave" : ""}`}
        aria-live="polite"
      >
        {deckFoods[index + 2] && (
          <FoodCard
            key={deckFoods[index + 2].id}
            food={deckFoods[index + 2]}
            className="card card-back"
            loading="eager"
          />
        )}
        {nextFood && (
          <FoodCard
            key={nextFood.id}
            food={nextFood}
            className="card card-next"
            loading="eager"
          />
        )}

        {currentFood ? (
          <FoodCard
            key={currentFood.id}
            food={currentFood}
            className={`card card-active ${decision ? `is-${decision}` : ""} ${isLeaving ? "is-leaving" : ""}`}
            decision={decision}
            style={{
              transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
              transition: drag.active
                ? "none"
                : isLeaving && leaveMode === "shuffle"
                  ? `transform ${shuffleTransDur}ms cubic-bezier(.16,.82,.22,1), opacity ${Math.round(shuffleTransDur * 0.84)}ms ease`
                  : isLeaving && leaveMode === "button"
                    ? "transform 430ms cubic-bezier(.16,.82,.22,1), opacity 360ms ease"
                    : isLeaving
                      ? "transform 260ms cubic-bezier(.2,.75,.2,1), opacity 220ms ease"
                      : "transform 180ms cubic-bezier(.2,.75,.2,1), opacity 180ms ease",
              opacity: Math.max(0, 1 - Math.abs(drag.x) / 520),
            }}
            onPointerDown={isShuffling ? undefined : onPointerDown}
            onPointerMove={isShuffling ? undefined : onPointerMove}
            onPointerUp={isShuffling ? undefined : onPointerUp}
            onPointerCancel={isShuffling ? undefined : onPointerUp}
          />
        ) : (
          <section className="done-card">
            <div className="done-emblem">
              <Utensils size={30} />
              <span className="done-emblem__badge">
                <Check size={13} strokeWidth={3} />
              </span>
            </div>

            <div className="done-heading">
              <h2>Đã xem hết {deckFoods.length} món!</h2>
              <p>Bộ lọc hiện tại đã duyệt xong rồi.</p>
            </div>

            <div className="done-stats">
              <div className="done-stat liked">
                <strong>{likedForMeal.length}</strong>
                <span>đã thích</span>
              </div>
              <div className="done-stat-sep" />
              <div className="done-stat skipped">
                <strong>{skippedForMeal.length}</strong>
                <span>đã bỏ qua</span>
              </div>
            </div>

            <button className="restart-button" onClick={() => setIndex(0)}>
              <RotateCcw size={15} />
              Xem lại nhóm này
            </button>
          </section>
        )}
      </section>

      <footer className="actions">
        <button className="action-button reject" onClick={() => finishSwipe("skip", "button")} disabled={!currentFood || isShuffling}>
          <X size={26} />
        </button>
        <button className="reset-button" onClick={resetDeck} disabled={isShuffling}>
          <RotateCcw size={16} />
        </button>
        <button className={`random-button${isShuffling ? " is-shuffling" : ""}`} onClick={handleRandom} disabled={!deckFoods.length || isShuffling}>
          <Shuffle size={16} />
        </button>
        <button className="action-button accept" onClick={() => finishSwipe("like", "button")} disabled={!currentFood || isShuffling}>
          <Check size={28} />
        </button>
      </footer>

      <section className={`liked-panel ${isLikedOpen ? "is-open" : ""}`}>
        <button className="liked-panel__toggle" onClick={() => setIsLikedOpen((value) => !value)}>
          <span className="liked-panel__icon">
            <Star size={16} fill="currentColor" />
          </span>
          <div className="liked-panel__toggle-text">
            <p>Danh sách yêu thích</p>
            <h2>{liked.length ? `${liked.length} món đã chọn` : "Chưa chọn món"}</h2>
          </div>
          <div className="liked-panel__toggle-end">
            {liked.length > 0 && <span className="liked-panel__count">{liked.length}</span>}
            <ChevronDown size={18} />
          </div>
        </button>

        {isLikedOpen && (
          <div className="liked-panel__body">
            {liked.length ? (
              <>
                <div className="liked-panel__list">
                  {liked.map((food, i) => (
                    <div className="liked-panel__item" key={`${food.id}-${i}`}>
                      <img src={imgSrc(food.image)} alt={food.name} className="liked-panel__thumb" onError={(e) => { e.currentTarget.src = food.fallbackImage; }} />
                      <div className="liked-panel__item-info">
                        <strong>{food.name}</strong>
                        <span>{food.tag}</span>
                      </div>
                      <div className="liked-panel__item-right">
                        <strong>{currency(food.price)}</strong>
                        <span>
                          <Star size={11} fill="currentColor" />
                          {food.rating}
                        </span>
                      </div>
                      <button
                        className="liked-panel__remove"
                        onClick={() => setLiked((items) => items.filter((_, idx) => idx !== i))}
                        aria-label="Xóa khỏi danh sách"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="liked-panel__total">
                  <span>Tổng cộng</span>
                  <strong>{currency(liked.reduce((sum, f) => sum + f.price, 0))}</strong>
                </div>
              </>
            ) : (
              <div className="liked-panel__empty">
                <Utensils size={26} />
                <p>Quẹt phải để thêm món vào đây</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function FoodCard({ food, className, decision, ...props }) {
  const { loading = "eager", ...cardProps } = props;

  return (
    <article className={className} {...cardProps}>
      {decision && <div className={`stamp ${decision}`}>{decision === "like" ? "V" : "X"}</div>}
      <img
        src={imgSrc(food.image)}
        alt={food.name}
        draggable="false"
        loading={loading}
        decoding="async"
        fetchPriority={className.includes("card-active") ? "high" : "auto"}
        onError={(event) => {
          const fb = food.fallbackImage;
          if (fb && event.currentTarget.src !== fb) {
            event.currentTarget.src = fb;
          }
        }}
      />
      <div className="card-gradient" />
      <div className="card-content">
        <div className="meta-row">
          <span>{food.tag}</span>
          <span>
            <Star size={15} fill="currentColor" />
            {food.rating}
          </span>
        </div>
        <h2>{food.name}</h2>
        <p>{food.description}</p>
        <div className="detail-row">
          <strong>{currency(food.price)}</strong>
          <span>{food.time}</span>
          <span>
            <Flame size={15} />
            {food.calories} kcal
          </span>
        </div>
        <div className="chips">
          {food.ingredients.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
