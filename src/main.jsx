import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ChevronDown, Flame, RotateCcw, Search, Star, Utensils, X } from "lucide-react";
import { foods } from "./foodData";
import "./styles.css";

const mealFilters = [
  { id: "all", label: "Tất cả", hint: "78 món" },
  { id: "sáng", label: "Sáng", hint: "nhanh gọn" },
  { id: "trưa", label: "Trưa", hint: "no bụng" },
  { id: "tối", label: "Tối", hint: "ấm cúng" },
];

function currency(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function foodMatchesMeal(food, meal) {
  if (meal === "all") return true;
  return food.tag.toLowerCase().includes(meal);
}

function App() {
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
  const startPoint = useRef(null);

  const deckFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter((food) => {
      if (!foodMatchesMeal(food, meal)) return false;
      if (q) return food.name.toLowerCase().includes(q);
      return true;
    });
  }, [meal, search]);
  const currentFood = deckFoods[index];
  const nextFood = deckFoods[index + 1];
  const decision = drag.x > 55 ? "like" : drag.x < -55 ? "skip" : null;
  const likedForMeal = liked.filter((food) => foodMatchesMeal(food, meal));
  const skippedForMeal = skipped.filter((food) => foodMatchesMeal(food, meal));

  useEffect(() => {
    const upcomingFoods = deckFoods.slice(index, index + 6);
    upcomingFoods.forEach((food) => {
      const image = new Image();
      image.src = food.image;
    });
  }, [deckFoods, index]);

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
      <header className="hero">
        <div className="brand-row">
          <span className="brand-mark">
            <Utensils size={18} />
          </span>
          <div>
            <p>Vietnam Food Match</p>
            <h1>Quẹt để chọn món Việt hôm nay</h1>
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

      <nav className="meal-tabs" aria-label="Lọc theo bữa ăn">
        {mealFilters.map((item) => (
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
                : isLeaving && leaveMode === "button"
                  ? "transform 430ms cubic-bezier(.16,.82,.22,1), opacity 360ms ease"
                  : isLeaving
                    ? "transform 260ms cubic-bezier(.2,.75,.2,1), opacity 220ms ease"
                  : "transform 180ms cubic-bezier(.2,.75,.2,1), opacity 180ms ease",
              opacity: Math.max(0, 1 - Math.abs(drag.x) / 520),
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
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
        <button className="action-button reject" onClick={() => finishSwipe("skip", "button")} disabled={!currentFood}>
          <X size={26} />
        </button>
        <button className="reset-button" onClick={resetDeck}>
          <RotateCcw size={16} />
        </button>
        <button className="action-button accept" onClick={() => finishSwipe("like", "button")} disabled={!currentFood}>
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
                      <img src={food.image} alt={food.name} className="liked-panel__thumb" onError={(e) => { e.currentTarget.src = food.fallbackImage; }} />
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
        src={food.image}
        alt={food.name}
        draggable="false"
        loading={loading}
        decoding="async"
        fetchPriority={className.includes("card-active") ? "high" : "auto"}
        onError={(event) => {
          if (food.fallbackImage && event.currentTarget.src !== food.fallbackImage) {
            event.currentTarget.src = food.fallbackImage;
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
