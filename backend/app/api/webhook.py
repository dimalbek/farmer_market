# api/webhooks.py
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from ..config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from ..database.database import get_db
from ..repositories.cart import CartRepository
from ..repositories.orders import OrdersRepository
from ..schemas.orders import OrderUpdate  # Импортируйте нужные схемы
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,  # Логировать INFO и выше
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Лог в консоль
        logging.FileHandler("webhook.log")  # Лог в файл
    ]
)

logger = logging.getLogger(__name__)

router = APIRouter()
orders_repository = OrdersRepository()
cart_repository = CartRepository()

# Установка ключа Stripe API
if not STRIPE_SECRET_KEY:
    logger.error("STRIPE_SECRET_KEY не установлен. Пожалуйста, установите переменную окружения.")
    raise Exception("Stripe API key не настроен.")
else:
    stripe.api_key = STRIPE_SECRET_KEY
    logger.info("Stripe API key успешно установлен.")

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        logger.info(f"Webhook event создан: {event['type']}")
    except ValueError as e:
        # Неверный payload
        logger.error("Неверный payload", exc_info=True)
        raise HTTPException(status_code=400, detail="Неверный payload")
    except stripe.error.SignatureVerificationError as e:
        # Неверная подпись
        logger.error("Неверная подпись", exc_info=True)
        raise HTTPException(status_code=400, detail="Неверная подпись")

    # Обработка события
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        logger.info("Обработка события checkout.session.completed")
        try:
            handle_checkout_session(session, db)
            logger.info("Событие checkout.session.completed обработано успешно")
        except HTTPException as e:
            logger.error(f"HTTPException при обработке вебхука: {e.detail}")
            raise e
        except Exception as e:
            logger.exception("Неожиданная ошибка при обработке вебхука")
            raise HTTPException(status_code=500, detail="Внутренняя ошибка при обработке вебхука")

    return JSONResponse(status_code=200, content={"status": "success"})


def handle_checkout_session(session, db: Session):
    try:
        if not session.client_reference_id:
            logger.error("client_reference_id отсутствует в сессии.")
            raise HTTPException(status_code=400, detail="client_reference_id отсутствует.")

        if not session.metadata.get('order_id'):
            logger.error("order_id отсутствует в метаданных сессии.")
            raise HTTPException(status_code=400, detail="order_id отсутствует в метаданных.")

        user_id = int(session.client_reference_id)
        order_id = int(session.metadata.get('order_id'))

        logger.info(f"Обработка сессии оплаты для user_id: {user_id}, order_id: {order_id}")

        # Получение заказа по order_id
        order = orders_repository.get_order_by_id(db, order_id)
        if not order:
            logger.error(f"Заказ с ID {order_id} не найден.")
            raise HTTPException(status_code=404, detail="Заказ не найден")

        # Обновление статуса заказа на 'Success'
        order_update = OrderUpdate(status='Paid')
        orders_repository.update_order(db, order_id, order_update)
        logger.info(f"Статус заказа ID {order_id} обновлён на 'Success'.")

        # Очистка корзины
        cart_repository.clear_cart(db, user_id)
        logger.info(f"Корзина очищена для user_id: {user_id}.")

    except HTTPException as e:
        logger.error(f"HTTPException в handle_checkout_session: {e.detail}", exc_info=True)
        raise e
    except Exception as e:
        logger.exception("Неожиданная ошибка в handle_checkout_session.")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка при обработке сессии оплаты.")