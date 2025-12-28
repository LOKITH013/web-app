from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
import uuid

import models
import schemas
from database import get_db

app = FastAPI(title="HR Management API")

# =========================
# CORS
# =========================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "HR backend running"}

# =========================
# COMPANY
# =========================

@app.get("/company_details", response_model=list[schemas.Company])
def list_companies(db: Session = Depends(get_db)):
    return (
        db.query(models.CompanyDetails)
        .filter(models.CompanyDetails.isactive == "Y")
        .all()
    )


@app.post("/company_details", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = models.CompanyDetails(
        id=str(uuid.uuid4()),
        **company.dict(exclude={"created_by"}),
        created_by=company.created_by or "system",
        created_datetime=datetime.utcnow(),
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@app.put("/company_details/{company_id}", response_model=schemas.Company)
def update_company(
    company_id: str,
    company: schemas.CompanyUpdate,
    db: Session = Depends(get_db),
):
    db_company = (
        db.query(models.CompanyDetails)
        .filter(models.CompanyDetails.id == company_id)
        .first()
    )
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    data = company.dict(exclude_unset=True)
    update_by = data.pop("update_by", None)

    for key, value in data.items():
        setattr(db_company, key, value)

    if update_by:
        db_company.update_by = update_by
    db_company.update_datetime = datetime.utcnow()

    db.commit()
    db.refresh(db_company)
    return db_company


@app.delete("/company_details/{company_id}")
def delete_company(company_id: str, db: Session = Depends(get_db)):
    db_company = (
        db.query(models.CompanyDetails)
        .filter(models.CompanyDetails.id == company_id)
        .first()
    )
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    db_company.isactive = "N"
    db_company.update_datetime = datetime.utcnow()
    db.commit()
    return {"message": "Company deactivated"}

# =========================
# DEPARTMENTS
# =========================

@app.get("/departments", response_model=list[schemas.Department])
def list_departments(db: Session = Depends(get_db)):
    return (
        db.query(models.Department)
        .filter(models.Department.isactive == "Y")
        .all()
    )


@app.post("/departments", response_model=schemas.Department)
def create_department(
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
):
    db_dept = models.Department(
        id=str(uuid.uuid4()),
        department_name=department.department_name,
        department_code=department.department_code,
        company_id=department.company_id,
        isactive=department.isactive or "Y",
        created_by=department.created_by or "system",
        created_datetime=datetime.utcnow(),
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept


@app.put("/departments/{dept_id}", response_model=schemas.Department)
def update_department(
    dept_id: str,
    department: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
):
    db_dept = (
        db.query(models.Department)
        .filter(models.Department.id == dept_id)
        .first()
    )
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    data = department.dict(exclude_unset=True)
    update_by = data.pop("update_by", None)

    for key, value in data.items():
        setattr(db_dept, key, value)

    if update_by:
        db_dept.update_by = update_by
    db_dept.update_datetime = datetime.utcnow()

    db.commit()
    db.refresh(db_dept)
    return db_dept


@app.delete("/departments/{dept_id}")
def delete_department(dept_id: str, db: Session = Depends(get_db)):
    db_dept = (
        db.query(models.Department)
        .filter(models.Department.id == dept_id)
        .first()
    )
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")

    db_dept.isactive = "N"
    db_dept.update_datetime = datetime.utcnow()
    db.commit()
    return {"message": "Department deactivated"}

# =========================
# HOLIDAYS
# =========================

@app.get("/holidays", response_model=list[schemas.Holiday])
def list_holidays(db: Session = Depends(get_db)):
    return (
        db.query(models.Holidays)
        .filter(models.Holidays.isactive == "Y")
        .order_by(models.Holidays.holiday_date)
        .all()
    )


@app.post("/holidays", response_model=schemas.Holiday)
def create_holiday(
    holiday: schemas.HolidayCreate,
    db: Session = Depends(get_db),
):
    db_holiday = models.Holidays(
        id=str(uuid.uuid4()),
        holiday_date=holiday.holiday_date,
        holiday_name=holiday.holiday_name,
        company_id=holiday.company_id,
        isactive=holiday.isactive or "Y",
        created_by=holiday.created_by or "system",
        created_datetime=datetime.utcnow(),
    )
    db.add(db_holiday)
    db.commit()
    db.refresh(db_holiday)
    return db_holiday


@app.put("/holidays/{holiday_id}", response_model=schemas.Holiday)
def update_holiday(
    holiday_id: str,
    holiday: schemas.HolidayUpdate,
    db: Session = Depends(get_db),
):
    db_holiday = (
        db.query(models.Holidays)
        .filter(models.Holidays.id == holiday_id)
        .first()
    )
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")

    data = holiday.dict(exclude_unset=True)
    update_by = data.pop("update_by", None)

    for key, value in data.items():
        setattr(db_holiday, key, value)

    if update_by:
        db_holiday.update_by = update_by
    db_holiday.update_datetime = datetime.utcnow()

    db.commit()
    db.refresh(db_holiday)
    return db_holiday


@app.delete("/holidays/{holiday_id}")
def delete_holiday(holiday_id: str, db: Session = Depends(get_db)):
    db_holiday = (
        db.query(models.Holidays)
        .filter(models.Holidays.id == holiday_id)
        .first()
    )
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")

    db_holiday.isactive = "N"
    db_holiday.update_datetime = datetime.utcnow()
    db.commit()
    return {"message": "Holiday deactivated"}

# =========================
# EMPLOYEE
# =========================

@app.get("/employee", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(get_db)):
    return (
        db.query(models.Employee)
        .filter(models.Employee.isactive == "Y")
        .all()
    )


@app.post("/employee", response_model=schemas.Employee)
def create_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
):
    db_emp = models.Employee(
        id=str(uuid.uuid4()),
        employee_id=employee.employee_id,
        employee_name=employee.employee_name,
        email_id=employee.email_id,
        password=employee.password,
        date_of_birth=employee.date_of_birth,
        date_of_join=employee.date_of_join,
        designation=employee.designation,
        supervisor_id=employee.supervisor_id,
        department_id=employee.department_id,
        work_location=employee.work_location,
        mobile_no=employee.mobile_no,
        company_id=employee.company_id,
        isactive=employee.isactive or "Y",
        created_by=employee.created_by or "system",
        created_datetime=datetime.utcnow(),
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

import uuid
from datetime import datetime, date
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

@app.post("/auth/signup", response_model=schemas.Employee)
def signup_user(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    try:
        # -------- Basic validation --------
        full_name = payload.full_name.strip()
        if not full_name:
            raise HTTPException(status_code=400, detail="Full name is required")

        email = payload.email.lower().strip()
        if not email.endswith("@gmail.com"):
            raise HTTPException(status_code=400, detail="Only Gmail addresses allowed")

        password = payload.password.strip()
        if len(password) > 10:
            raise HTTPException(
                status_code=400,
                detail="Password must be at most 10 characters",
            )

        # -------- Duplicate email check --------
        if db.query(models.Employee).filter(
            models.Employee.email_id == email
        ).first():
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists",
            )

        # -------- Pick DEFAULT active company --------
        default_company = (
            db.query(models.CompanyDetails)
            .filter(models.CompanyDetails.isactive == "Y")
            .first()
        )
        if not default_company:
            raise HTTPException(
                status_code=400,
                detail="No active company found. Create a company first.",
            )

        # -------- Pick DEFAULT active department --------
        default_department = (
            db.query(models.Department)
            .filter(models.Department.isactive == "Y")
            .first()
        )
        if not default_department:
            raise HTTPException(
                status_code=400,
                detail="No active department found. Create a department first.",
            )

        # -------- Create employee --------
        new_employee = models.Employee(
            id=str(uuid.uuid4()),
            employee_id=f"EMP{uuid.uuid4().hex[:8]}",
            employee_name=full_name,
            email_id=email,
            password=password,
            date_of_join=date.today(),                 # NOT NULL
            company_id=default_company.id,             # SAFE
            department_id=default_department.id,        # SAFE
            isactive="Y",
            created_by="signup",
            created_datetime=datetime.utcnow(),
        )

        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)

        return new_employee

    except IntegrityError as e:
        print("IntegrityError:", e)
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database constraint error (check default company/department)",
        )

@app.post("/auth/login", response_model=schemas.Employee)
def login_user(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    # -------- validate email --------
    email = payload.email.lower().strip()
    if not email.endswith("@gmail.com"):
        raise HTTPException(
            status_code=400,
            detail="Only Gmail addresses allowed",
        )

    # -------- find user --------
    user = (
        db.query(models.Employee)
        .filter(
            models.Employee.email_id == email,
            models.Employee.isactive == "Y",
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or user inactive",
        )

    # -------- validate password --------
    if user.password != payload.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return user


@app.put("/employee/{emp_id}", response_model=schemas.Employee)
def update_employee(
    emp_id: str,
    employee: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
):
    db_emp = (
        db.query(models.Employee)
        .filter(models.Employee.id == emp_id)
        .first()
    )
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    data = employee.dict(exclude_unset=True)
    update_by = data.pop("update_by", None)

    for key, value in data.items():
        setattr(db_emp, key, value)

    if update_by:
        db_emp.update_by = update_by
    db_emp.update_datetime = datetime.utcnow()

    db.commit()
    db.refresh(db_emp)
    return db_emp


@app.delete("/employee/{emp_id}")
def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    db_emp = (
        db.query(models.Employee)
        .filter(models.Employee.id == emp_id)
        .first()
    )
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db_emp.isactive = "N"
    db_emp.update_datetime = datetime.utcnow()
    db.commit()
    return {"message": "Employee deactivated"}
