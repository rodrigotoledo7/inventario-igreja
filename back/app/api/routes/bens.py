from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_bem_service, get_current_user
from app.models import User
from app.schemas import BemCreate, BemResponse, BemUpdate
from app.services.bem_service import BemService

router = APIRouter(prefix="/bens", tags=["bens"])


@router.get("", response_model=list[BemResponse])
def list_bens(
    current_user: User = Depends(get_current_user),
    svc: BemService = Depends(get_bem_service),
) -> list:
    return svc.list_bens()


@router.post("", response_model=BemResponse, status_code=status.HTTP_201_CREATED)
def create_bem(
    payload: BemCreate,
    current_user: User = Depends(get_current_user),
    svc: BemService = Depends(get_bem_service),
):
    try:
        return svc.create_bem(payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{bem_id}", response_model=BemResponse)
def update_bem(
    bem_id: int,
    payload: BemUpdate,
    current_user: User = Depends(get_current_user),
    svc: BemService = Depends(get_bem_service),
):
    try:
        return svc.update_bem(bem_id, payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{bem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bem(
    bem_id: int,
    current_user: User = Depends(get_current_user),
    svc: BemService = Depends(get_bem_service),
) -> None:
    try:
        svc.delete_bem(bem_id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))