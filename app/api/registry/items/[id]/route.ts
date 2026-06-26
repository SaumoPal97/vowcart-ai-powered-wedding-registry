import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { deleteRegistryItem, updateRegistryItem } from "@/lib/repos/registry"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const item = await updateRegistryItem(id, {
      priority: body.priority,
      status: body.status,
    })
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json({ item })
  } catch (err) {
    console.error("[v0] PATCH /api/registry/items/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const ok = await deleteRegistryItem(id)
    return NextResponse.json({ success: ok })
  } catch (err) {
    console.error("[v0] DELETE /api/registry/items/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    )
  }
}
