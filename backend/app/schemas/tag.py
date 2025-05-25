from pydantic import BaseModel

class TagBase(BaseModel):
    name: str
    color: str = "#6B7280"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    
    class Config:
        from_attributes = True