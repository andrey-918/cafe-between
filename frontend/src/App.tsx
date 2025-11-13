import { useState } from 'react'
import './styel/App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app">
      <header>
        <img src="../info/logo.jpeg" alt="Cafe Between Logo" className="logo" />
        <nav>
          <button onClick={() => setMenuOpen(!menuOpen)}>Меню</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Добро пожаловать в Cafe Between</h1>
          <p>Место, где встречаются искусство, кофе и уют. Погрузитесь в атмосферу творчества и вдохновения.</p>
        </section>

        <section className="news">
          <h2>Новости и мероприятия</h2>
          <div className="event">
            <h3>Выставка фотографа Паши Букриева</h3>
            <p>с 20.07 по 31.08</p>
            <p>Павел фотограф и художник, в основном работающий с пленкой и аналоговыми материалами. В своих работах он экспериментально исследует различные формы взаимодействия с реальностью вдохновленной обыденным и воображаемым миром построенным на личных мифах. Цвет, форма, структура, повышенное вниманием к деталям являются составляющими элементами его работ.</p>
            <p>Всегда приятно совместить чашку вкусного кофе с впечатлением, погрузится в творческий мир талантливого художника.</p>
            <p>Все работы можно приобрести в коллекцию.</p>
            <p>Ждем в гости с 08 до 20.00 в будни и с 09.00 до 21.00 в выходные</p>
            <div className="photos">
              <img src="../info/event_example/photo_2025-11-12 16.33.19.jpeg" alt="Event Photo 1" />
              <img src="../info/event_example/photo_2025-11-12 16.33.22.jpeg" alt="Event Photo 2" />
              <img src="../info/event_example/photo_2025-11-12 16.33.23.jpeg" alt="Event Photo 3" />
            </div>
          </div>
        </section>

        <section className="location-contacts">
          <h2>Местоположение и контакты</h2>
          <p><strong>Адрес:</strong> ул. Примерная, 123, Город</p>
          <p><strong>Телефон:</strong> +7 (123) 456-78-90</p>
          <p><strong>Email:</strong> info@cafebetween.ru</p>
          <p><strong>Часы работы:</strong> Пн-Пт 8:00-20:00, Сб-Вс 9:00-21:00</p>
        </section>

        {menuOpen && (
          <section className="menu">
            <h2>Меню</h2>
            <div className="food-photos">
              <img src="../info/food/photo_2025-11-12 16.35.23.jpeg" alt="Food 1" />
              <img src="../info/food/photo_2025-11-12 16.35.24.jpeg" alt="Food 2" />
              <img src="../info/food/photo_2025-11-12 16.35.26.jpeg" alt="Food 3" />
              <img src="../info/food/photo_2025-11-12 16.35.27.jpeg" alt="Food 4" />
              <img src="../info/food/photo_2025-11-12 16.36.42.jpeg" alt="Food 5" />
            </div>
            <p>Подробное меню доступно по запросу. Свяжитесь с нами для заказа.</p>
          </section>
        )}
      </main>

      <footer>
        <p>&copy; 2023 Cafe Between. Все права защищены.</p>
      </footer>
    </div>
  )
}

export default App
