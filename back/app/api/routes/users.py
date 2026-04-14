from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_admin_user, get_user_service
from app.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(get_current_admin_user),
    svc: UserService = Depends(get_user_service),
) -> list[User]:
    return svc.list_users()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    svc: UserService = Depends(get_user_service),
) -> User:
    try:
        return svc.create_user(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    svc: UserService = Depends(get_user_service),
) -> User:
    try:
        return svc.update_user(user_id, payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    svc: UserService = Depends(get_user_service),
) -> None:
    try:
        svc.delete_user(user_id, current_user_id=current_user.id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))