from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, Union
from datetime import date, datetime

# =========================
# COMPANY
# =========================

class CompanyBase(BaseModel):
    company_name: str
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    post_code: Optional[str] = None
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    website_link: Optional[str] = None
    isactive: Optional[str] = "Y"


class CompanyCreate(CompanyBase):
    created_by: Optional[str] = None


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    address_1: Optional[str] = None
    address_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    post_code: Optional[str] = None
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    website_link: Optional[str] = None
    isactive: Optional[str] = None
    update_by: Optional[str] = None


class Company(CompanyBase):
    id: str
    created_by: Optional[str] = None
    created_datetime: Optional[datetime] = None
    update_by: Optional[str] = None
    update_datetime: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# =========================
# DEPARTMENT
# =========================

class DepartmentBase(BaseModel):
    department_name: str
    department_code: Optional[str] = None
    company_id: str
    isactive: Optional[str] = "Y"


class DepartmentCreate(DepartmentBase):
    created_by: Optional[str] = None


class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    company_id: Optional[str] = None
    isactive: Optional[str] = None
    update_by: Optional[str] = None


class Department(DepartmentBase):
    id: str
    created_by: Optional[str] = None
    created_datetime: Optional[datetime] = None
    update_by: Optional[str] = None
    update_datetime: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# =========================
# HOLIDAYS
# =========================

class HolidayBase(BaseModel):
    holiday_date: Union[str, date]
    holiday_name: str
    company_id: str
    isactive: Optional[str] = "Y"

    @field_validator("holiday_date", mode="before")
    @classmethod
    def parse_holiday_date(cls, v):
        if isinstance(v, date):
            return v
        return datetime.strptime(v, "%Y-%m-%d").date()


class HolidayCreate(HolidayBase):
    created_by: Optional[str] = None


class HolidayUpdate(BaseModel):
    holiday_date: Optional[Union[str, date]] = None
    holiday_name: Optional[str] = None
    company_id: Optional[str] = None
    isactive: Optional[str] = None
    update_by: Optional[str] = None


class Holiday(HolidayBase):
    id: str
    created_by: Optional[str] = None
    created_datetime: Optional[datetime] = None
    update_by: Optional[str] = None
    update_datetime: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# =========================
# EMPLOYEE
# =========================

class EmployeeBase(BaseModel):
    employee_id: str
    employee_name: str
    email_id: str
    password: Optional[str] = None

    date_of_birth: Optional[Union[str, date]] = None
    date_of_join: Union[str, date]           # NOT NULL IN DB

    designation: Optional[str] = None
    supervisor_id: Optional[str] = None
    department_id: str
    work_location: Optional[str] = None
    mobile_no: Optional[str] = None
    company_id: str

    isactive: Optional[str] = "Y"

    @field_validator("date_of_birth", "date_of_join", mode="before")
    @classmethod
    def parse_dates(cls, v):
        if v is None:
            return v
        if isinstance(v, date):
            return v
        return datetime.strptime(v, "%Y-%m-%d").date()


class EmployeeCreate(EmployeeBase):
    password: str
    created_by: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, v):
        if len(v) > 10:
            raise ValueError("Password must be at most 10 characters")
        return v


class EmployeeUpdate(BaseModel):
    employee_name: Optional[str] = None
    password: Optional[str] = None
    designation: Optional[str] = None
    supervisor_id: Optional[str] = None
    department_id: Optional[str] = None
    work_location: Optional[str] = None
    mobile_no: Optional[str] = None
    isactive: Optional[str] = None
    update_by: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, v):
        if v is not None and len(v) > 10:
            raise ValueError("Password must be at most 10 characters")
        return v


class Employee(EmployeeBase):
    id: str
    created_by: Optional[str] = None
    created_datetime: Optional[datetime] = None
    update_by: Optional[str] = None
    update_datetime: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    # company_id: str
    # department_id: str

class LoginRequest(BaseModel):
    email: str
    password: str
