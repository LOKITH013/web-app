from sqlalchemy import Column, String, Date, DateTime, CHAR
from datetime import datetime

from database import Base

# =========================
# COMPANY
# =========================

class CompanyDetails(Base):
    __tablename__ = "company_details"

    id = Column(String(50), primary_key=True)

    company_name = Column(String(200), nullable=False)
    address_1 = Column(String(200))
    address_2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    post_code = Column(String(20))

    contact_person = Column(String(150))
    phone_number = Column(String(20))
    website_link = Column(String(255))

    created_datetime = Column(DateTime)
    created_by = Column(String(50))

    update_by = Column(String(50))
    update_datetime = Column(DateTime)

    isactive = Column(CHAR(1), default="Y")


# =========================
# DEPARTMENTS
# =========================

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True)

    department_name = Column(String(255))
    department_code = Column(String(50))

    company_id = Column(String(36))

    isactive = Column(String(1))

    created_by = Column(String(255))
    created_datetime = Column(DateTime)

    update_by = Column(String(255))
    update_datetime = Column(DateTime)


# =========================
# EMPLOYEE
# =========================

class Employee(Base):
    __tablename__ = "employee"

    id = Column(String(50), primary_key=True)

    employee_id = Column(String(50), nullable=False)
    employee_name = Column(String(150), nullable=False)

    date_of_birth = Column(Date)
    date_of_join = Column(Date, nullable=False)

    designation = Column(String(100))
    supervisor_id = Column(String(50))

    department_id = Column(String(50))
    work_location = Column(String(200))

    email_id = Column(String(150), nullable=False)
    password = Column(String(10))   # EXACT MATCH

    mobile_no = Column(String(20))

    created_datetime = Column(DateTime)
    created_by = Column(String(50))

    update_by = Column(String(50))
    update_datetime = Column(DateTime)

    company_id = Column(String(50))

    isactive = Column(CHAR(1), default="Y")


# =========================
# HOLIDAYS
# =========================

class Holidays(Base):
    __tablename__ = "holidays"

    id = Column(String(50), primary_key=True)

    holiday_date = Column(Date, nullable=False)
    holiday_name = Column(String(150), nullable=False)

    created_datetime = Column(DateTime)
    created_by = Column(String(50))

    update_by = Column(String(50))
    update_datetime = Column(DateTime)

    company_id = Column(String(50))

    isactive = Column(CHAR(1), default="Y")
