from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.tag import Tag, TagCreate
from app.models.task import Tag as TagModel
from app.services.auth import get_current_user
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[Tag])
async def get_tags(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tags = db.query(TagModel).all()
    return tags

@router.post("/", response_model=Tag)
async def create_tag(
    tag: TagCreate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if tag already exists
    existing_tag = db.query(TagModel).filter(TagModel.name == tag.name).first()
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag already exists")
    
    db_tag = TagModel(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted successfully"}