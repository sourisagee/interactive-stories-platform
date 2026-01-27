import { Link } from "react-router-dom";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import "./MainPage.css";

export default function MainPage() {
  const { user } = useAppSelector((state) => state.user);

  return (
    <div className="main-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Платформа <span className="highlight">интерактивных новелл</span>
          </h1>
          <p className="hero-description">
            Современная платформа для создания и чтения интерактивных историй с
            разветвленным сюжетом. Здесь каждый может стать автором
            захватывающих приключений или погрузиться в мир, где ваши решения
            определяют судьбу героев.
          </p>

          {!user ? (
            <div className="hero-actions">
              <Link to="/signUp" className="btn btn-primary">
                Присоединиться
              </Link>
              <Link to="/signIn" className="btn btn-secondary">
                Войти
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/stories" className="btn btn-primary">
                Исследовать истории
              </Link>
              <Link to="/profile" className="btn btn-secondary">
                Мой профиль
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <h2 className="section-title">О проекте</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Наша платформа создана для тех, кто любит интерактивные истории
                и хочет участвовать в их создании. Мы объединяем авторов и
                читателей в единое сообщество, где каждый может найти что-то для
                себя.
              </p>
              <p>
                Проект разработан с использованием современных технологий:
                React, TypeScript, Node.js и PostgreSQL, что обеспечивает
                быструю работу и надежность платформы.
              </p>
            </div>
         
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Возможности платформы</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Библиотека историй</h3>
              <p>
                Огромная коллекция интерактивных новелл различных жанров. От
                фантастики до романтики - найдите историю по душе.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Визуальный редактор</h3>
              <p>
                Интуитивный редактор с drag-and-drop интерфейсом для создания
                сложных разветвленных сюжетов без программирования.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Сохранение прогресса</h3>
              <p>
                Ваш прогресс автоматически сохраняется. Продолжайте чтение с
                того места, где остановились, на любом устройстве.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types">
        <div className="container">
          <h2 className="section-title">Выберите свою роль</h2>

          <div className="user-types-grid">
            <div className="user-type-card">
              <div className="user-type-icon">👤</div>
              <h3>Читатель </h3>
              <div className="user-type-description">
                <p>Для тех, кто любит погружаться в интерактивные истории</p>
                <ul className="features-list">
                  <li>✓ Чтение всех опубликованных историй</li>
                  <li>✓ Сохранение прогресса прохождения</li>
                  <li>✓ Персональная статистика</li>
                  <li>✓ Система достижений</li>
                  <li>✓ Оценка и комментирование историй</li>
                  <li>✓ Закладки любимых произведений</li>
                  <li>✓ Рекомендации на основе предпочтений</li>
                </ul>
              </div>
            </div>

            <div className="user-type-card featured">
              <div className="user-type-icon">✍️</div>
              <h3>Автор </h3>
              <div className="user-type-description">
                <p>
                  Для творческих людей, желающих создавать интерактивные истории
                </p>
                <ul className="features-list">
                  <li>✓ Все возможности читателя</li>
                  <li>✓ Создание неограниченного количества историй</li>
                  <li>✓ Визуальный редактор с drag-and-drop</li>
                  <li>✓ Управление узлами и выборами</li>
                  <li>✓ Загрузка изображений для сцен</li>
                  <li>✓ Система черновиков и публикации</li>
                  <li>✓ Детальная аналитика произведений</li>
                  <li>✓ Управление доступом к историям</li>
                  <li>✓ Монетизация контента (в разработке)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Benefits */}
      {!user && (
        <section className="benefits">
          <div className="container">
            

            <div className="benefits-content">
              <div className="benefits-main">
                <h3>Что вы получите сразу после регистрации:</h3>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-icon">🔐</div>
                    <h4>Персональный аккаунт</h4>
                    <p>
                      Ваш личный профиль с настройками, статистикой и историей
                      активности
                    </p>
                  </div>

                  <div className="benefit-card">
                    <div className="benefit-icon">💾</div>
                    <h4>Облачное сохранение</h4>
                    <p>
                      Прогресс синхронизируется между устройствами. Читайте где
                      удобно
                    </p>
                  </div>

                  <div className="benefit-card">
                    <div className="benefit-icon">🚀</div>
                    <h4>Ранний доступ</h4>
                    <p>
                      Первыми узнавайте о новых функциях и получайте доступ к
                      бета-версиям
                    </p>
                  </div>
                </div>
              </div>

              <div className="cta-section">
                <h3>Готовы начать свое приключение?</h3>
                <p>
                  Присоединяйтесь к растущему сообществу любителей интерактивных
                  историй!
                </p>
                <div className="cta-buttons">
                  <Link to="/signUp" className="btn btn-large btn-primary">
                    Зарегистрироваться
                  </Link>
                  <Link to="/signIn" className="btn btn-large btn-accent">
                    Войти
                  </Link>
                </div>
                
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Интерактивные новеллы</h4>
              <p>
                Платформа для создания и чтения интерактивных историй нового
                поколения.
              </p>
            </div>
            <div className="footer-section">
              <h4>Технологии</h4>
              <p>React • TypeScript • Node.js • PostgreSQL • Express</p>
            </div>
            <div className="footer-section">
              <h4>Контакты</h4>
              <p>Есть вопросы? Свяжитесь с нами через форму обратной связи.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; 2026 Интерактивные новеллы. Создано с ❤️ для любителей
              хороших историй.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
