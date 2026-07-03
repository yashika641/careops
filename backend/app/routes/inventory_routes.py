from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database import get_supabase
from app.schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from app.auth import require_staff, require_admin
from supabase import Client
import uuid
from datetime import datetime

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item: InventoryCreate,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Create a new inventory item (Staff/Admin only)"""
    
    try:
        item_data = {
            "id": str(uuid.uuid4()),
            "item_name": item.item_name,
            "quantity": item.quantity,
            "supplier": item.supplier,
            "reorder_level": item.reorder_level,
            "price": item.price,
            "category": item.category,
            "is_low_stock": item.quantity <= item.reorder_level,
        }
        
        result = supabase.table("inventory").insert(item_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create inventory item"
            )
        
        # Log inventory history
        history_entry = {
            "id": str(uuid.uuid4()),
            "inventory_id": item_data["id"],
            "action": "created",
            "quantity_change": item.quantity,
            "user_id": current_user["id"],
            "notes": f"Initial stock: {item.quantity}"
        }
        
        supabase.table("inventory_history").insert(history_entry).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create inventory item: {str(e)}"
        )


@router.get("", response_model=List[InventoryResponse])
async def get_inventory(
    low_stock_only: bool = Query(False),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get all inventory items with optional filters"""
    
    try:
        query = supabase.table("inventory").select("*")
        
        # Apply filters
        if low_stock_only:
            query = query.eq("is_low_stock", True)
        
        if category:
            query = query.eq("category", category)
        
        # Order by name
        query = query.order("item_name")
        
        result = query.execute()
        
        return result.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inventory: {str(e)}"
        )


@router.get("/alerts")
async def get_low_stock_alerts(
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get low stock alerts"""
    
    try:
        result = supabase.table("inventory").select("*").eq("is_low_stock", True).execute()
        
        return {
            "count": len(result.data),
            "items": result.data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alerts: {str(e)}"
        )


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: str,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific inventory item"""
    
    try:
        result = supabase.table("inventory").select("*").eq("id", item_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory item not found"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inventory item: {str(e)}"
        )


@router.get("/{item_id}/history")
async def get_inventory_history(
    item_id: str,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get inventory history for an item"""
    
    try:
        result = supabase.table("inventory_history").select("""
            *,
            users(username)
        """).eq("inventory_id", item_id).order("created_at", desc=True).execute()
        
        return result.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inventory history: {str(e)}"
        )


@router.patch("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: str,
    update_data: InventoryUpdate,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Update an inventory item"""
    
    try:
        # Get existing item
        existing = supabase.table("inventory").select("*").eq("id", item_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory item not found"
            )
        
        old_item = existing.data[0]
        
        # Prepare update data
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Check if quantity changed
        quantity_change = 0
        if "quantity" in update_dict:
            quantity_change = update_dict["quantity"] - old_item["quantity"]
            
            # Update low stock status
            reorder_level = update_dict.get("reorder_level", old_item["reorder_level"])
            update_dict["is_low_stock"] = update_dict["quantity"] <= reorder_level
        
        update_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Update item
        result = supabase.table("inventory").update(update_dict).eq("id", item_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update inventory item"
            )
        
        # Log history if quantity changed
        if quantity_change != 0:
            action = "added" if quantity_change > 0 else "removed"
            history_entry = {
                "id": str(uuid.uuid4()),
                "inventory_id": item_id,
                "action": action,
                "quantity_change": abs(quantity_change),
                "user_id": current_user["id"],
                "notes": f"Quantity {action}: {abs(quantity_change)}"
            }
            
            supabase.table("inventory_history").insert(history_entry).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update inventory item: {str(e)}"
        )


@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: str,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Delete an inventory item (Admin only)"""
    
    try:
        result = supabase.table("inventory").delete().eq("id", item_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventory item not found"
            )
        
        return {"message": "Inventory item deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete inventory item: {str(e)}"
        )
