from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from .user_schema import UserResponse, UserRole


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: UserRole
    designation: str | None = Field(default=None, max_length=150)
    department: str | None = Field(default=None, max_length=150)

    @field_validator("name", "designation", "department", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()

    @field_validator("password")
    @classmethod
    def validate_bcrypt_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes.")
        return value

    @model_validator(mode="after")
    def validate_role_fields(self):
        if self.role in {"employee", "management"}:
            if not self.designation:
                raise ValueError("Designation is required for employees and management.")
            if not self.department:
                raise ValueError("Department is required for employees and management.")
        else:
            self.designation = None
            self.department = None
        return self


class LoginRequest(BaseModel):
    role: UserRole
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()


class AuthResponse(BaseModel):
    message: str
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
