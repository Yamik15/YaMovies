import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals'

// URL вебхука
const ENDPOINT = 'https://webhook.site/931e35a6-6654-46a3-8b30-5e347823700e'

/**
 * Обогащает метрику контекстом и отправляет на сервер.
 * Fallback: если sendBeacon недоступен — только console.
 */
function send(metric) {
    const payload = {
        // Все поля, которые web-vitals даёт из коробки:
        name: metric.name,        // 'LCP', 'INP', 'CLS' и т.д.
        value: metric.value,      // числовое значение метрики
        rating: metric.rating,    // 'good' | 'needs-improvement' | 'poor'
        id: metric.id,            // уникальный id метрики
        navigationType: metric.navigationType, // 'navigate' | 'reload' | 'back-forward'

        // Наш контекст:
        url: window.location.href,
        timestamp: Date.now(),

        // Опционально: тип устройства
        device: window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop',
    }

    // Всегда логируем — удобно для отладки и для скриншота в отчёт
    console.log('[web-vitals]', payload.name, payload.value, payload)

    // Пробуем отправить на сервер
    if (typeof navigator.sendBeacon === 'function') {
        // Отправляем как text/plain, чтобы не триггерить CORS preflight.
        // Тело при этом остаётся JSON-строкой — webhook.site его распарсит.
        const body = JSON.stringify(payload)
        const blob = new Blob([body], { type: 'text/plain' })
        navigator.sendBeacon(ENDPOINT, blob)
    }
}

// Подключаем сбор всех пяти метрик
onLCP(send)
onINP(send, { reportAllChanges: true })
onCLS(send)
onFCP(send)
onTTFB(send)