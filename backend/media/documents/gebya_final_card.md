# Gebya Final Backend Card — Claude Code Prompt + Postman Guide

---

## CLAUDE CODE PROMPT

```
You are working inside the Gebya Django project. All apps are fully implemented:
accounts, organizations, listings, transactions, payments, search, properties,
compliance, benchmarks. This is the final backend card. No new models. No new
features. This day is entirely about: configuring pytest with factory_boy, writing
comprehensive tests for every app, achieving 70%+ code coverage, and fixing every
bug found. Abel cannot start the frontend until every acceptance criterion passes.

━━━ NON-NEGOTIABLE RULES ━━━
1. Never skip a failing test — fix the code, not the test
2. Never comment out a failing test
3. Never add a file to coverage exclusions to inflate the percentage
4. The Redis lock concurrency test MUST pass — it is the most important test
5. Fix every bug the tests expose before moving to the next app
6. Run `pytest --cov=. --cov-report=term-missing` after every fix

━━━ PREREQUISITE CHECK ━━━
Before writing any test code:
  1. pip install pytest pytest-django pytest-cov factory_boy freezegun
     Add all to requirements/development.txt
  2. Confirm Redis is running:
     docker compose exec redis redis-cli ping → must return PONG
  3. Confirm PostGIS:
     python manage.py shell -c "from django.contrib.gis.geos import Point; print(Point(38.8, 9.0))"
  4. Run: python manage.py check → must return 0 errors

━━━ PYTEST CONFIGURATION ━━━

Create pytest.ini at project root:

  [pytest]
  DJANGO_SETTINGS_MODULE = gebya.settings
  python_files = tests.py test_*.py *_tests.py
  python_classes = Test*
  python_functions = test_*
  addopts =
    --reuse-db
    --cov=.
    --cov-report=term-missing
    --cov-omit=*/migrations/*,*/settings*,manage.py,*/wsgi*,*/asgi*,gebya/celery.py,*/conftest*
  filterwarnings =
    ignore::DeprecationWarning

Create conftest.py at project root:

  import pytest
  from rest_framework.test import APIClient

  @pytest.fixture(autouse=True)
  def reset_redis():
    from gebya.redis_client import get_redis
    r = get_redis()
    r.flushdb()
    yield
    r.flushdb()

  @pytest.fixture
  def api_client():
    return APIClient()

  @pytest.fixture
  def admin_user(db):
    from accounts.factories import UserFactory
    return UserFactory(role='admin', is_staff=True, is_superuser=True)

  @pytest.fixture
  def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client

━━━ FACTORIES — one factories.py per app ━━━
Never use Model.objects.create() directly in tests. Always use factories.

── accounts/factories.py ──
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth.hashers import make_password
from .models import User

class UserFactory(DjangoModelFactory):
  class Meta:
    model = User
  username   = factory.Sequence(lambda n: f'user{n}')
  email      = factory.Sequence(lambda n: f'user{n}@gebya.et')
  first_name = factory.Faker('first_name')
  last_name  = factory.Faker('last_name')
  phone      = factory.Sequence(lambda n: f'+2519{str(n).zfill(8)}')
  role       = 'buyer'
  password   = factory.LazyFunction(lambda: make_password('GebYa@2024'))
  is_active  = True

── organizations/factories.py ──
import factory
from factory.django import DjangoModelFactory
from django.core.files.base import ContentFile
from accounts.factories import UserFactory
from .models import Brokerage, Agent, Developer

def _fake_pdf():
  return ContentFile(b'%PDF-1.4 fake content', name='test.pdf')

class BrokerageFactory(DjangoModelFactory):
  class Meta:
    model = Brokerage
  name       = factory.Sequence(lambda n: f'Brokerage {n}')
  license_no = factory.Sequence(lambda n: f'LIC-{n:04d}')
  status     = 'verified'
  region     = 'Addis Ababa'
  license_doc = factory.LazyFunction(_fake_pdf)

class AgentFactory(DjangoModelFactory):
  class Meta:
    model = Agent
  user         = factory.SubFactory(UserFactory, role='listing_agent')
  brokerage    = factory.SubFactory(BrokerageFactory)
  muid_license = factory.Sequence(lambda n: f'MUID-{n:05d}')
  role         = 'listing_agent'
  verified     = True
  license_doc  = factory.LazyFunction(_fake_pdf)

class BuyersAgentFactory(AgentFactory):
  user = factory.SubFactory(UserFactory, role='buyers_agent')
  role = 'buyers_agent'

class DeveloperFactory(DjangoModelFactory):
  class Meta:
    model = Developer
  user            = factory.SubFactory(UserFactory, role='developer')
  brokerage       = factory.SubFactory(BrokerageFactory)
  name            = factory.Sequence(lambda n: f'Developer {n}')
  competence_cert = factory.LazyFunction(_fake_pdf)
  land_permit     = factory.Sequence(lambda n: f'LP-{n}')
  escrow_bank     = 'Commercial Bank of Ethiopia'
  escrow_account  = factory.Sequence(lambda n: f'100{n:010d}')
  verified        = True

── listings/factories.py ──
import factory
from factory.django import DjangoModelFactory
from django.contrib.gis.geos import Point, MultiPolygon, Polygon
from organizations.factories import AgentFactory, DeveloperFactory, BrokerageFactory
from .models import Woreda, ListingAgreement, Project, Unit
from decimal import Decimal

def _bole_boundary():
  coords = ((38.78,9.00),(38.83,9.00),(38.83,9.05),(38.78,9.05),(38.78,9.00))
  return MultiPolygon(Polygon(coords, srid=4326), srid=4326)

class WoredaFactory(DjangoModelFactory):
  class Meta:
    model = Woreda
    django_get_or_create = ('name', 'region')
  name     = 'Bole'
  region   = 'Addis Ababa'
  boundary = factory.LazyFunction(_bole_boundary)

class ListingAgreementFactory(DjangoModelFactory):
  class Meta:
    model = ListingAgreement
  developer            = factory.SubFactory(DeveloperFactory)
  listing_agent        = factory.SubFactory(AgentFactory)
  total_commission_pct = Decimal('4.00')
  buyers_agent_pct     = Decimal('2.00')
  is_active            = True

class ProjectFactory(DjangoModelFactory):
  class Meta:
    model = Project
  listing_agreement = factory.SubFactory(ListingAgreementFactory)
  name              = factory.Sequence(lambda n: f'Project {n}')
  location          = factory.LazyFunction(lambda: Point(38.80, 9.02, srid=4326))
  build_permit      = factory.Sequence(lambda n: f'BP-{n}')
  total_units       = 10
  completion_pct    = 75
  # woreda is auto-detected on save — do NOT set in factory

class UnitFactory(DjangoModelFactory):
  class Meta:
    model = Unit
  project        = factory.SubFactory(ProjectFactory)
  unit_number    = factory.Sequence(lambda n: f'A{n:03d}')
  floor          = 1
  bedrooms       = 2
  area_m2        = Decimal('85.00')
  price_etb      = Decimal('3500000.00')
  price_usd      = Decimal('25000.00')
  rate_snapshot  = Decimal('140.00')
  status         = 'active'
  completion_pct = 75

── transactions/factories.py ──
import factory
from factory.django import DjangoModelFactory
from accounts.factories import UserFactory
from organizations.factories import BuyersAgentFactory
from listings.factories import UnitFactory
from decimal import Decimal
from .models import BuyerAgreement, Offer, Closing
from django.utils import timezone

class BuyerAgreementFactory(DjangoModelFactory):
  class Meta:
    model = BuyerAgreement
  buyers_agent      = factory.SubFactory(BuyersAgentFactory)
  buyer             = factory.SubFactory(UserFactory, role='buyer')
  agreed_commission = Decimal('2.00')
  is_active         = True

class OfferFactory(DjangoModelFactory):
  class Meta:
    model = Offer
  unit            = factory.SubFactory(UnitFactory)
  buyer_agreement = factory.SubFactory(BuyerAgreementFactory)
  offered_price   = Decimal('3400000.00')
  status          = 'pending'

── payments/factories.py ──
import factory
from factory.django import DjangoModelFactory
from transactions.factories import OfferFactory
from listings.factories import ProjectFactory
from accounts.factories import UserFactory
from .models import PaymentSchedule, EscrowRecord, AuditEvent
from decimal import Decimal
from django.utils import timezone
import datetime

class PaymentScheduleFactory(DjangoModelFactory):
  class Meta:
    model = PaymentSchedule
  offer          = factory.SubFactory(OfferFactory)
  installment_no = factory.Sequence(lambda n: n + 1)
  amount_etb     = Decimal('500000.00')
  due_date       = factory.LazyFunction(lambda: timezone.now().date() + datetime.timedelta(days=30))

class EscrowRecordFactory(DjangoModelFactory):
  class Meta:
    model = EscrowRecord
  project         = factory.SubFactory(ProjectFactory)
  total_collected = Decimal('0')
  total_escrowed  = Decimal('0')
  compliance_flag = False

class AuditEventFactory(DjangoModelFactory):
  class Meta:
    model = AuditEvent
  actor       = factory.SubFactory(UserFactory)
  event_type  = 'test_event'
  entity_type = 'Unit'
  entity_id   = 1
  payload     = {}

━━━ TESTS — write these in each app's tests.py ━━━

── accounts/tests.py ──
@pytest.mark.django_db
class TestAccountsAuth:
  def setup_method(self):
    self.client = APIClient()
    self.register_url = '/api/v1/auth/register/'
    self.token_url    = '/api/v1/auth/token/'
    self.me_url       = '/api/v1/auth/me/'

  def _valid_payload(self, **overrides):
    base = {
      'username': 'testuser', 'email': 'test@gebya.et',
      'first_name': 'Test', 'last_name': 'User',
      'phone': '+251911234567', 'role': 'buyer',
      'password': 'GebYa@2024', 'password_confirm': 'GebYa@2024',
    }
    base.update(overrides)
    return base

  def test_register_valid_returns_201(self):
    r = self.client.post(self.register_url, self._valid_payload(), format='json')
    assert r.status_code == 201

  def test_register_role_admin_returns_restricted_role(self):
    r = self.client.post(self.register_url, self._valid_payload(role='admin'), format='json')
    assert r.status_code == 400
    assert 'restricted_role' in str(r.data)

  def test_register_invalid_phone(self):
    r = self.client.post(self.register_url, self._valid_payload(phone='0911234567'), format='json')
    assert r.status_code == 400
    assert 'invalid_phone_format' in str(r.data)

  def test_register_duplicate_email(self):
    self.client.post(self.register_url, self._valid_payload(), format='json')
    r = self.client.post(self.register_url, self._valid_payload(username='other'), format='json')
    assert r.status_code == 400
    assert 'user_email_exists' in str(r.data)

  def test_login_correct_credentials(self):
    from accounts.factories import UserFactory
    user = UserFactory(); user.set_password('GebYa@2024'); user.save()
    r = self.client.post(self.token_url, {'username': user.username, 'password': 'GebYa@2024'}, format='json')
    assert r.status_code == 200
    assert 'access' in r.data and 'refresh' in r.data

  def test_login_wrong_password_returns_401(self):
    from accounts.factories import UserFactory
    user = UserFactory()
    r = self.client.post(self.token_url, {'username': user.username, 'password': 'wrong'}, format='json')
    assert r.status_code == 401

  def test_me_with_token_returns_200(self):
    from accounts.factories import UserFactory
    user = UserFactory()
    self.client.force_authenticate(user=user)
    assert self.client.get(self.me_url).status_code == 200

  def test_me_no_token_returns_401(self):
    assert self.client.get(self.me_url).status_code == 401

── transactions/tests.py — CRITICAL REDIS LOCK TEST ──
# MUST use @pytest.mark.django_db(transaction=True)
# Without transaction=True, threads cannot see each other's DB writes
# and the test passes trivially even with a broken lock.

@pytest.mark.django_db(transaction=True)
class TestRedisLock:
  def test_redis_lock_prevents_double_booking(self):
    import threading
    from rest_framework.test import APIClient
    from listings.factories import UnitFactory, WoredaFactory
    from organizations.factories import BuyersAgentFactory
    from transactions.factories import BuyerAgreementFactory
    from transactions.models import Offer

    WoredaFactory()
    unit = UnitFactory(status='active')
    agent_a = BuyersAgentFactory()
    agent_b = BuyersAgentFactory()
    agreement_a = BuyerAgreementFactory(buyers_agent=agent_a)
    agreement_b = BuyerAgreementFactory(buyers_agent=agent_b)

    client_a = APIClient(); client_a.force_authenticate(user=agent_a.user)
    client_b = APIClient(); client_b.force_authenticate(user=agent_b.user)

    results = []
    barrier = threading.Barrier(2)  # forces both threads to fire simultaneously

    def fire(client, agreement):
      barrier.wait()
      r = client.post('/api/v1/offers/', {
        'unit': unit.pk, 'buyer_agreement': agreement.pk, 'offered_price': '3300000'
      }, format='json')
      results.append(r.status_code)

    t1 = threading.Thread(target=fire, args=(client_a, agreement_a))
    t2 = threading.Thread(target=fire, args=(client_b, agreement_b))
    t1.start(); t2.start(); t1.join(); t2.join()

    assert sorted(results) == [201, 409], (
      f"DOUBLE BOOKING! Got {results}. Redis lock is broken."
    )
    assert Offer.objects.filter(unit=unit).count() == 1
    unit.refresh_from_db()
    assert unit.status == 'under_contract'

@pytest.mark.django_db
class TestCommissionCalculation:
  def test_closing_exact_commission_amounts(self):
    from transactions.factories import OfferFactory
    from listings.factories import UnitFactory, WoredaFactory, ListingAgreementFactory
    from transactions.models import Closing
    from decimal import Decimal
    from django.utils import timezone
    WoredaFactory()
    la = ListingAgreementFactory(
      total_commission_pct=Decimal('4.00'),
      buyers_agent_pct=Decimal('2.00')
    )
    unit = UnitFactory(project__listing_agreement=la)
    offer = OfferFactory(unit=unit, status='accepted')
    closing = Closing.objects.create(
      offer=offer,
      final_price_etb=Decimal('4500000.00'),
      closed_at=timezone.now(),
    )
    assert closing.listing_agent_comm == Decimal('90000.00')
    assert closing.buyers_agent_comm  == Decimal('90000.00')
    assert closing.platform_fee       == Decimal('9000.00')

── payments/tests.py — WEBHOOK SECURITY ──
@pytest.mark.django_db
class TestWebhookSecurity:
  def _valid_sig(self, body: bytes) -> str:
    import hmac, hashlib
    from django.conf import settings
    return hmac.new(settings.CHAPA_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()

  def test_valid_signature_processes_payment(self, api_client):
    import json
    from payments.factories import PaymentScheduleFactory
    inst = PaymentScheduleFactory()
    body = json.dumps({'status':'success','tx_ref':f'installment-{inst.pk}','chapa_transfer_id':'REF'}).encode()
    r = api_client.post('/api/v1/payments/chapa/webhook/',
      data=body, content_type='application/json',
      HTTP_X_CHAPA_SIGNATURE=self._valid_sig(body))
    assert r.status_code == 200
    inst.refresh_from_db()
    assert inst.paid_at is not None

  def test_invalid_signature_returns_401_no_db_change(self, api_client):
    import json
    from payments.factories import PaymentScheduleFactory
    inst = PaymentScheduleFactory()
    body = json.dumps({'status':'success','tx_ref':f'installment-{inst.pk}'}).encode()
    r = api_client.post('/api/v1/payments/chapa/webhook/',
      data=body, content_type='application/json',
      HTTP_X_CHAPA_SIGNATURE='wrong')
    assert r.status_code == 401
    inst.refresh_from_db()
    assert inst.paid_at is None, "DB was modified despite invalid signature — SECURITY BREACH"

━━━ RUN THE SUITE ━━━
  docker compose exec backend pytest --cov=. --cov-report=term-missing -v

Fix every failure. Re-run. Repeat until:
  → 0 failures
  → Coverage ≥ 70%

━━━ SIGN-OFF ━━━
Abel sends three things before frontend starts:
  1. Screenshot: pytest output — 0 failures
  2. Screenshot: coverage report — ≥ 70%
  3. Postman manual checklist — all 41 requests verified
```

---

## POSTMAN TESTING GUIDE

**Setup first:** Create a Postman Environment.
- Variable `base` = `http://localhost:8000/api/v1`
- Variable `token` = (empty, fill after each login)
- Set `Authorization: Bearer {{token}}` on all authenticated requests.

---

### PHASE 1 — Auth

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 1 | POST | `{{base}}/auth/register/` | JSON: username, email, phone (+251911234567), role=buyer, password, password_confirm | ✅ 201, id in response |
| 2 | POST | `{{base}}/auth/register/` | Same but role=admin | ❌ 400, restricted_role |
| 3 | POST | `{{base}}/auth/register/` | phone=0911234567 (no +251) | ❌ 400, invalid_phone_format |
| 4 | POST | `{{base}}/auth/register/` | Duplicate email from step 1 | ❌ 400, user_email_exists |
| 5 | POST | `{{base}}/auth/token/` | username + password from step 1. **Copy access → token env var** | ✅ 200, access+refresh+role |
| 6 | POST | `{{base}}/auth/token/` | Wrong password | ❌ 401 |
| 7 | GET | `{{base}}/auth/me/` | Bearer {{token}} | ✅ 200, email matches |
| 8 | GET | `{{base}}/auth/me/` | No auth header | ❌ 401 |
| 9 | PATCH | `{{base}}/auth/me/` | `{"first_name":"Almaz"}` | ✅ 200, first_name updated |

---

### PHASE 2 — Organizations (login as admin, get admin token first)

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 10 | POST | `{{base}}/brokerages/` | form-data: name, license_no=LIC-001, region=Addis Ababa, license_doc=(PDF file) | ✅ 201, status=pending. Save `brokerage_id` |
| 11 | POST | `{{base}}/brokerages/{{brokerage_id}}/verify/` | admin token, `{"action":"approve"}` | ✅ 200, status=verified, verified_at not null, verified_by=admin |
| 12 | GET | `{{base}}/brokerages/{{brokerage_id}}/badge/` | **No auth header** | ✅ 200, name+license_no+status visible |
| 13 | POST | `{{base}}/agents/` | listing agent token, form-data: brokerage, muid_license=MUID-001, role=listing_agent, license_doc | ✅ 201, verified=false. Save `agent_id` |
| 14 | POST | `{{base}}/agents/{{agent_id}}/verify/` | admin token, `{"action":"approve"}` | ✅ 200, verified=true |
| 15 | POST | `{{base}}/developers/` | form-data: brokerage, name, competence_cert, land_permit, escrow_bank, escrow_account | ✅ 201, verified=false. Save `dev_id` |
| 16 | POST | `{{base}}/developers/{{dev_id}}/verify/` | admin token | ✅ 200, verified=true |

---

### PHASE 3 — Listings (verified listing agent token)

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 17 | POST | `{{base}}/listing-agreements/` | developer, listing_agent, total_commission_pct=4.00, buyers_agent_pct=2.00 | ✅ 201. Save `la_id` |
| 18 | POST | `{{base}}/listing-agreements/` | buyers_agent_pct=5.00, total=3.00 | ❌ 400, invalid_commission_split |
| 19 | POST | `{{base}}/projects/` | listing_agreement=la_id, location=`{"type":"Point","coordinates":[38.80,9.02]}`, build_permit=BP-001 | ✅ 201, **woreda auto-detected (not null)**. Save `project_id` |
| 20 | POST | `{{base}}/units/create/` | project, unit_number=A101, floor=1, bedrooms=2, area_m2=85, price_etb=3500000, price_usd=25000, rate_snapshot=140 | ✅ 201, **property_id starts with ETH-AA-**. Save `property_id` |
| 21 | POST | `{{base}}/projects/{{project_id}}/units/bulk/` | form-data: file=(CSV with 5 rows). Columns: unit_number,floor,bedrooms,area_m2,price_etb,price_usd,rate_snapshot | ✅ 201, created=5, errors=[] |

---

### PHASE 4 — Search & Public

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 22 | GET | `{{base}}/search/units/?lat=9.02&lng=38.80&radius_km=5` | No auth | ✅ 200, distance field present, sorted nearest first, **buyers_agent_pct ABSENT** |
| 23 | GET | `{{base}}/search/units/?woreda=bole` | No auth | ✅ 200, units inside Bole boundary |
| 24 | GET | `{{base}}/search/units/?bbox=38.78,9.00,38.83,9.05` | No auth | ✅ 200, units inside box |
| 25 | GET | `{{base}}/search/units/?woreda=bole&bedrooms=2&min_price=2000000` | **Buyer agent token** | ✅ 200, **buyers_agent_pct PRESENT** |
| 26 | GET | `{{base}}/projects/geojson/` | No auth | ✅ 200, type=FeatureCollection, features array, **no pagination keys (count/next/results absent)** |
| 27 | GET | `{{base}}/properties/{{property_id}}/` | **No auth** | ✅ 200, property_id+developer_name+price_range+ownership_chain, **buyers_agent_pct ABSENT** |
| 28 | GET | `{{base}}/properties/INVALID-XYZ-9999/` | No auth | ❌ 404 |

---

### PHASE 5 — Transactions (register buyer agent, verify, get token)

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 29 | POST | `{{base}}/buyer-agreements/` | buyer agent token, buyer=buyer_user_id, agreed_commission=2.00 | ✅ 201, is_active=true. Save `ba_id` |
| 30 | POST | `{{base}}/offers/` | buyer agent token, unit=unit_id, buyer_agreement=ba_id, offered_price=3400000 | ✅ 201, status=pending. Save `offer_id`. **Check unit is now under_contract** |
| 31 | POST | `{{base}}/offers/` | Same unit, second attempt | ❌ 409 or 400, unit not available |
| 32 | POST | `{{base}}/offers/{{offer_id}}/respond/` | **Listing agent token**, `{"action":"accept"}` | ✅ 200, status=accepted |
| 33 | POST | `{{base}}/offers/{{offer_id}}/respond/` | `{"action":"counter","counter_price":3600000}` (use a different offer) | ✅ 200, status=countered |
| 34 | POST | `{{base}}/closings/` | listing agent token, offer=offer_id (accepted), final_price_etb=4500000, closed_at=now ISO | ✅ 201, **listing_agent_comm=90000, buyers_agent_comm=90000, platform_fee=9000**, unit status=sold |

---

### PHASE 6 — Payments & Webhooks

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 35 | POST | `{{base}}/payments/chapa/webhook/` | Header: `x-chapa-signature`=(valid HMAC-SHA256). Body: `{"status":"success","tx_ref":"installment-{id}","chapa_transfer_id":"REF-001"}` | ✅ 200, paid_at set, escrow updated, AuditEvent written |
| 36 | POST | `{{base}}/payments/chapa/webhook/` | Same body, wrong signature | ❌ 401, **zero DB changes** |
| 37 | GET | `{{base}}/escrow/` | gov_verifier token | ✅ 200, compliance_flag visible |

---

### PHASE 7 — Compliance & Benchmarks

| # | Method | Endpoint | Notes | Expected |
|---|--------|----------|-------|----------|
| 38 | GET | `{{base}}/admin/compliance/overview/` | admin or gov_verifier token | ✅ 200, all count fields present |
| 39 | POST | `{{base}}/admin/compliance/overview/` | **gov_verifier token** | ❌ 403, gov_verifier cannot POST |
| 40 | GET | `{{base}}/admin/projects/at-risk/` | admin token | ✅ 200, risk_reasons array on each item |
| 41 | GET | `{{base}}/benchmarks/bole/` | No auth | ✅ 200, median_price_per_m2_etb (number or null), total_sold_units, woreda=Bole |
| 42 | GET | `{{base}}/benchmarks/atlantis/` | No auth | ❌ 404 |

---

### PHASE 8 — Django Admin Visual Check (browser, not Postman)

Open http://localhost:8000/admin/ and verify:

| # | Check | What to look for |
|---|-------|-----------------|
| 43 | Brokerage list | Approve action sets status=verified + verified_at + verified_by |
| 44 | EscrowRecord list | Red/flagged indicator visible for compliance_flag=True rows |
| 45 | AuditEvent list | **No Add, Change, or Delete buttons anywhere** |
| 46 | Offer list | All fields read-only, no edit buttons |
| 47 | Project list | ⚠ DELAYED indicator for completion_pct < 80 + past completion date |

---

**Zero 500s rule:** If any request returns 500, stop immediately. Run `docker compose logs backend` to read the traceback. A 500 always means either a missing `select_related`, an unhandled `None`, or a missing migration. Fix it before continuing the checklist.
