# backend/app/api/hosts.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, UTC
from typing import List

from app.schemas.host import Cluster, ClusterCreate, Node, NodeCreate, NodeUpdate
from app.models.host import Cluster as ClusterModel, Node as NodeModel
from app.db.session import get_db

router = APIRouter()

# Cluster endpoints
@router.get("/clusters", response_model=List[Cluster])
def list_clusters(db: Session = Depends(get_db)):
    """Fetch all clusters with their nodes."""
    return db.query(ClusterModel).all()

@router.post("/clusters", response_model=Cluster, status_code=status.HTTP_201_CREATED)
def create_cluster(cluster: ClusterCreate, db: Session = Depends(get_db)):
    """Create a new cluster."""
    db_cluster = ClusterModel(**cluster.model_dump())
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster

@router.post("/nodes", response_model=Node, status_code=status.HTTP_201_CREATED)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    """Create a new node."""
    # Verify cluster exists
    cluster = db.query(ClusterModel).filter(ClusterModel.id == node.cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    
    db_node = NodeModel(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@router.get("/nodes/{node_id}", response_model=Node)
def get_node(node_id: int, db: Session = Depends(get_db)):
    """Get a specific node by ID."""
    node = db.query(NodeModel).filter(NodeModel.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.put("/nodes/{node_id}", response_model=Node)
def update_node(node_id: int, node_update: NodeUpdate, db: Session = Depends(get_db)):
    """Update a node."""
    db_node = db.query(NodeModel).filter(NodeModel.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    update_data = node_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_node, field, value)
    
    db_node.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(db_node)
    return db_node

@router.delete("/nodes/{node_id}")
def delete_node(node_id: int, db: Session = Depends(get_db)):
    """Delete a node."""
    db_node = db.query(NodeModel).filter(NodeModel.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    db.delete(db_node)
    db.commit()
    return {"message": "Node deleted successfully"}
