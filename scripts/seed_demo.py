"""
Seed script for SmartSupport AI demo.
Creates sample businesses with realistic data to demonstrate the platform.

Usage: python scripts/seed_demo.py
Requires: The backend to be running and the database to be accessible.
"""

import asyncio
import random
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

async def seed_demo_data():
    # Import after path setup
    from app.database import async_session, init_db
    from app.models.business import Business
    from app.models.user import User
    from app.models.customer import Customer
    from app.models.conversation import Conversation, Message
    from app.models.ticket import Ticket
    from app.models.appointment import Appointment
    from app.models.order import Order, OrderItem
    from app.models.product import Product
    from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
    from app.models.subscription import Subscription, BusinessHours
    from app.services.auth import hash_password
    from sqlalchemy import select
    import uuid
    from datetime import datetime, timedelta, time

    async with async_session() as db:
        # Check if demo data exists
        result = await db.execute(select(Business).where(Business.email == 'demo@restaurant.com'))
        if result.scalar_one_or_none():
            print("Demo data already exists. Skipping.")
            return

        # Create 4 sample businesses
        businesses = [
            {
                "name": "Buna Cafe & Restaurant",
                "email": "demo@restaurant.com",
                "phone": "+251-911-123-456",
                "address": "Bole Road, Addis Ababa, Ethiopia",
                "category": "restaurant",
                "description": "Traditional Ethiopian restaurant serving authentic dishes. Open daily for lunch and dinner. specializing in injera, tibs, and traditional coffee ceremonies.",
                "timezone": "Africa/Addis_Ababa",
            },
            {
                "name": "Sheba Grand Hotel",
                "email": "demo@hotel.com",
                "phone": "+251-911-234-567",
                "address": "Churchill Avenue, Addis Ababa, Ethiopia",
                "category": "hotel",
                "description": "Premium hotel offering luxurious rooms, conference facilities, and traditional hospitality. 24/7 reception and room service.",
                "timezone": "Africa/Addis_Ababa",
            },
            {
                "name": "Tena Health Clinic",
                "email": "demo@clinic.com",
                "phone": "+251-911-345-678",
                "address": "Kazanchis, Addis Ababa, Ethiopia",
                "category": "clinic",
                "description": "Modern medical clinic providing general checkups, pediatric care, dental services, and laboratory tests. Walk-ins welcome.",
                "timezone": "Africa/Addis_Ababa",
            },
            {
                "name": "Merkato Fashion Hub",
                "email": "demo@retail.com",
                "phone": "+251-911-456-789",
                "address": "Merkato, Addis Ababa, Ethiopia",
                "category": "retail",
                "description": "Fashion retail store offering modern clothing, traditional Ethiopian attire, and accessories. Quality fashion at affordable prices.",
                "timezone": "Africa/Addis_Ababa",
            }
        ]

        for biz_data in businesses:
            business = Business(
                id=uuid.uuid4(),
                name=biz_data["name"],
                email=biz_data["email"],
                phone=biz_data["phone"],
                address=biz_data["address"],
                category=biz_data["category"],
                description=biz_data["description"],
                timezone=biz_data["timezone"],
                subscription_tier="business" if biz_data["category"] in ["hotel", "clinic"] else "starter",
                subscription_status="active",
                is_active=True
            )
            db.add(business)

            # Create admin user
            admin = User(
                id=uuid.uuid4(),
                business_id=business.id,
                email=biz_data["email"],
                password_hash=hash_password("password123"),
                full_name=f"Admin - {biz_data['name']}",
                role="admin",
                is_active=True
            )
            db.add(admin)

            # Create sample customers
            customers_data = [
                {"name": "Abebe Kebede", "email": "abebe@email.com", "phone": "+251-912-111-111"},
                {"name": "Sara Mohammed", "email": "sara@email.com", "phone": "+251-912-222-222"},
                {"name": "John Smith", "email": "john@email.com", "phone": "+251-912-333-333"},
            ]
            customers = []
            for c in customers_data:
                customer = Customer(
                    id=uuid.uuid4(),
                    business_id=business.id,
                    name=c["name"],
                    email=c["email"],
                    phone=c["phone"],
                    source="chat"
                )
                db.add(customer)
                customers.append(customer)

            # Create sample conversations
            for i, customer in enumerate(customers):
                conv = Conversation(
                    id=uuid.uuid4(),
                    business_id=business.id,
                    customer_id=customer.id,
                    channel="web",
                    status="active" if i < 2 else "resolved",
                    language="en",
                    is_escalated=(i == 1),
                    started_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                )
                db.add(conv)

                # Add messages
                msg1 = Message(
                    id=uuid.uuid4(), conversation_id=conv.id,
                    sender_type="customer", content=f"Hello! I have a question about your {biz_data['category']} services.",
                    content_type="text", created_at=conv.started_at
                )
                db.add(msg1)

                msg2 = Message(
                    id=uuid.uuid4(), conversation_id=conv.id,
                    sender_type="ai", content=f"Hello! Welcome to {biz_data['name']}. How can I help you today? We're happy to assist with any questions about our services.",
                    content_type="text", created_at=conv.started_at + timedelta(seconds=2)
                )
                db.add(msg2)

            # Create sample tickets
            for i, customer in enumerate(customers[:2]):
                ticket = Ticket(
                    id=uuid.uuid4(),
                    business_id=business.id,
                    customer_id=customer.id,
                    subject=f"Question about {biz_data['category']} pricing" if i == 0 else "Booking issue",
                    description=f"I would like to know more about the pricing options available." if i == 0 else "I'm having trouble booking online. Can you help?",
                    priority="medium" if i == 0 else "high",
                    status="open" if i == 0 else "in_progress",
                    category="pricing" if i == 0 else "technical",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 5))
                )
                db.add(ticket)

            # Create sample products
            products_data = []
            if biz_data["category"] == "restaurant":
                products_data = [
                    {"name": "Special Tibs", "price": 450, "category": "Main Course"},
                    {"name": "Vegetarian Combo", "price": 350, "category": "Main Course"},
                    {"name": "Traditional Coffee", "price": 80, "category": "Beverages"},
                ]
            elif biz_data["category"] == "hotel":
                products_data = [
                    {"name": "Standard Room", "price": 2500, "category": "Accommodation"},
                    {"name": "Deluxe Suite", "price": 5000, "category": "Accommodation"},
                    {"name": "Conference Hall", "price": 15000, "category": "Services"},
                ]
            elif biz_data["category"] == "clinic":
                products_data = [
                    {"name": "General Checkup", "price": 500, "category": "Medical"},
                    {"name": "Dental Cleaning", "price": 800, "category": "Dental"},
                    {"name": "Blood Test", "price": 300, "category": "Lab"},
                ]
            elif biz_data["category"] == "retail":
                products_data = [
                    {"name": "Traditional Dress", "price": 2500, "category": "Clothing"},
                    {"name": "Modern Shirt", "price": 1200, "category": "Clothing"},
                    {"name": "Leather Bag", "price": 3500, "category": "Accessories"},
                ]

            products = []
            for p in products_data:
                product = Product(
                    id=uuid.uuid4(), business_id=business.id,
                    name=p["name"], price=p["price"], currency="ETB",
                    category=p["category"], is_available=True,
                    stock_quantity=random.randint(10, 100),
                )
                db.add(product)
                products.append(product)

            # Create sample appointments
            for i, customer in enumerate(customers[:2]):
                appt = Appointment(
                    id=uuid.uuid4(), business_id=business.id,
                    customer_id=customer.id,
                    title=f"{biz_data['category'].title()} Appointment",
                    start_time=datetime.utcnow() + timedelta(days=random.randint(1, 7)),
                    end_time=datetime.utcnow() + timedelta(days=random.randint(1, 7), hours=1),
                    status="scheduled" if i == 0 else "confirmed",
                    service_name=products_data[i]["name"] if i < len(products_data) else "General Service",
                )
                db.add(appt)

            # Create sample orders
            for i, customer in enumerate(customers[:2]):
                order = Order(
                    id=uuid.uuid4(), business_id=business.id,
                    customer_id=customer.id,
                    order_number=f"ORD-{business.name[:3].upper()}-{random.randint(1000, 9999)}",
                    status="confirmed" if i == 0 else "completed",
                    total_amount=sum(p.price * (i + 1) for p in products[:2]),
                    currency="ETB",
                )
                db.add(order)

                for j, p in enumerate(products[:2]):
                    item = OrderItem(
                        id=uuid.uuid4(), order_id=order.id,
                        product_id=p.id, name=p.name,
                        quantity=i + 1, unit_price=float(p.price),
                        total_price=float(p.price) * (i + 1),
                    )
                    db.add(item)

            # Add knowledge document
            doc = KnowledgeDocument(
                id=uuid.uuid4(), business_id=business.id,
                title=f"{biz_data['name']} FAQ",
                file_type="faq",
                content=f"""
Frequently Asked Questions for {biz_data['name']}

1. What are your operating hours?
We are open Monday to Sunday, 8:00 AM to 10:00 PM.

2. What payment methods do you accept?
We accept cash, mobile money, and bank cards.

3. Do you offer delivery?
Yes, we offer delivery within Addis Ababa.

4. How can I make a reservation?
You can make a reservation through our website, by phone, or by visiting us in person.

5. What is your cancellation policy?
Cancellations must be made 24 hours in advance for a full refund.
                """,
                chunk_count=3,
            )
            db.add(doc)

            # Add business hours
            for day in range(7):
                hours = BusinessHours(
                    id=uuid.uuid4(), business_id=business.id,
                    day_of_week=day,
                    open_time=time(8, 0) if day < 6 else time(9, 0),
                    close_time=time(22, 0) if day < 6 else time(18, 0),
                    is_closed=False,
                )
                db.add(hours)

            # Add subscription
            sub = Subscription(
                id=uuid.uuid4(), business_id=business.id,
                plan="starter",
                status="active",
                current_period_start=datetime.utcnow() - timedelta(days=30),
                current_period_end=datetime.utcnow() + timedelta(days=30),
                features={"max_conversations": 1000, "max_documents": 20, "team_members": 5, "channels": ["web", "whatsapp"]},
            )
            db.add(sub)

        await db.commit()
        print("Demo data seeded successfully!")
        print("Login credentials for all businesses: admin@business.com / password123")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())
