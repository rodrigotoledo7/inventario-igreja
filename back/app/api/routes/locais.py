from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_local_service
from app.models import User
from app.schemas import LocalCreate, LocalResponse, LocalUpdate
from app.services.local_service import LocalService

router = APIRouter(prefix="/locais", tags=["locais"])


@router.get("", response_model=list[LocalResponse])
def list_locais(
    current_user: User = Depends(get_current_user),
    svc: LocalService = Depends(get_local_service),
) -> list:
    return svc.list_locais()


@router.post("", response_model=LocalResponse, status_code=status.HTTP_201_CREATED)
def create_local(
    payload: LocalCreate,
    current_user: User = Depends(get_current_user),
    svc: LocalService = Depends(get_local_service),
):
    try:
        return svc.create_local(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{local_id}", response_model=LocalResponse)
def update_local(
    local_id: int,
    payload: LocalUpdate,
    current_user: User = Depends(get_current_user),
    svc: LocalService = Depends(get_local_service),
):
    try:
        return svc.update_local(local_id, payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{local_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_local(
    local_id: int,
    current_user: User = Depends(get_current_user),
    svc: LocalService = Depends(get_local_service),
) -> None:
    try:
        svc.delete_local(local_id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))