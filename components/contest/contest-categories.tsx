"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Edit2, Trash2 } from "lucide-react";
import {
  createContestCategory,
  deleteContestCategory,
  updateContestCategory,
  reorderContestCategories,
} from "@/app/manage/contests/[contestId]/category-actions";
import { ContestCategory } from "@/lib/database-types";

interface ContestCategoriesProps {
  contestId: string;
  initialCategories?: ContestCategory[];
}

export function ContestCategories({
  contestId,
  initialCategories = [],
}: ContestCategoriesProps) {
  const [categories, setCategories] =
    useState<ContestCategory[]>(initialCategories);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to sort categories properly
  const sortCategories = (cats: ContestCategory[]) => {
    return [...cats].sort((a, b) => {
      // If both have the same sort_order (likely 0), sort alphabetically
      if (a.sort_order === b.sort_order) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }
      // Otherwise sort by sort_order
      return a.sort_order - b.sort_order;
    });
  };

  // Validation helper functions
  const isCategoryNameTaken = (name: string, excludeId?: string) => {
    return categories.some(
      (cat) =>
        cat.id !== excludeId && cat.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const getAddCategoryError = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return null;
    if (isCategoryNameTaken(trimmedName)) {
      return "A category with this name already exists";
    }
    return null;
  };

  const getEditCategoryError = () => {
    const trimmedName = editingCategoryName.trim();
    if (!trimmedName) return null;
    if (isCategoryNameTaken(trimmedName, editingId || undefined)) {
      return "A category with this name already exists";
    }
    return null;
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || getAddCategoryError()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Determine the next sort_order
      const allSortOrdersAreZero = categories.every(
        (cat) => cat.sort_order === 0,
      );
      const nextSortOrder = allSortOrdersAreZero
        ? 0
        : Math.max(...categories.map((cat) => cat.sort_order), -1) + 1;

      const result = await createContestCategory(
        contestId,
        newCategoryName.trim(),
        nextSortOrder,
      );

      if (result.success && result.data) {
        const updatedCategories = sortCategories([...categories, result.data]);
        setCategories(updatedCategories);
        setNewCategoryName("");
        setIsAddDialogOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCategory = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteContestCategory(contestId, id);

      if (result.success) {
        // Filter out the removed category
        const remainingCategories = categories.filter((cat) => cat.id !== id);

        // Check if we need to renumber (if any category has sort_order > 0)
        const hasExplicitOrdering = remainingCategories.some(
          (cat) => cat.sort_order > 0,
        );

        if (hasExplicitOrdering && remainingCategories.length > 0) {
          // Sort the remaining categories and renumber consecutively
          const sortedRemaining = sortCategories(remainingCategories);
          const renumberedCategories = sortedRemaining.map((cat, index) => ({
            ...cat,
            sort_order: index + 1, // 1, 2, 3, 4...
          }));

          // Update sort orders in the database to maintain consecutive numbering
          const categoryUpdates = renumberedCategories.map((cat) => ({
            id: cat.id,
            sort_order: cat.sort_order,
          }));

          if (categoryUpdates.length > 0) {
            await reorderContestCategories(contestId, categoryUpdates);
          }

          setCategories(renumberedCategories);
        } else {
          // No explicit ordering or no remaining categories, just update local state
          setCategories(remainingCategories);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove category",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEditCategory = (category: ContestCategory) => {
    setEditingId(category.id);
    setEditingCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const saveEditCategory = async () => {
    if (!editingCategoryName.trim() || !editingId || getEditCategoryError())
      return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateContestCategory(contestId, editingId, {
        name: editingCategoryName.trim(),
      });

      if (result.success && result.data) {
        const updatedCategories = categories.map((cat) =>
          cat.id === editingId ? result.data : cat,
        );

        // Re-sort categories after name change (important if sort_orders are all 0)
        setCategories(sortCategories(updatedCategories));

        setEditingId(null);
        setEditingCategoryName("");
        setIsEditDialogOpen(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const moveCategory = async (id: string, direction: "up" | "down") => {
    const sortedCategories = sortCategories(categories);
    const currentIndex = sortedCategories.findIndex((cat) => cat.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedCategories.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const newCategories = [...sortedCategories];
      [newCategories[currentIndex], newCategories[newIndex]] = [
        newCategories[newIndex],
        newCategories[currentIndex],
      ];

      // Update sort_order values to maintain explicit ordering
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        sort_order: index + 1, // Start from 1 to avoid all zeros
      }));

      // Prepare the updates for the server action
      const categoryUpdates = updatedCategories.map((cat) => ({
        id: cat.id,
        sort_order: cat.sort_order,
      }));

      const result = await reorderContestCategories(contestId, categoryUpdates);

      if (result.success) {
        setCategories(updatedCategories);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reorder categories",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        {categories.length > 0 ? (
          sortCategories(categories).map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="flex-1">{category.name}</span>
              <div className="flex items-center gap-2">
                {/* Reorder buttons */}
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 px-1"
                    onClick={() => moveCategory(category.id, "up")}
                    disabled={index === 0 || isLoading}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 px-1"
                    onClick={() => moveCategory(category.id, "down")}
                    disabled={
                      index === sortCategories(categories).length - 1 ||
                      isLoading
                    }
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Edit button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditCategory(category)}
                  disabled={isLoading}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                {/* Remove button */}
                <Dialog
                  onOpenChange={(open) => {
                    if (open) setError(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Category</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove &ldquo;{category.name}
                        &rdquo;? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => removeCategory(category.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Removing..." : "Remove"}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        ) : (
          /* Empty state */
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No categories yet</p>
            <p className="text-sm">Add your first category to get started!</p>
          </div>
        )}

        {/* Add Category Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) setError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-blue-600">
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Enter a name for the new category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Best Costume, Most Creative..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !getAddCategoryError()) {
                      addCategory();
                    }
                  }}
                  className={getAddCategoryError() ? "border-red-500" : ""}
                />
                {getAddCategoryError() && (
                  <p className="text-sm text-red-500">
                    {getAddCategoryError()}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={addCategory}
                disabled={
                  !newCategoryName.trim() ||
                  !!getAddCategoryError() ||
                  isLoading
                }
              >
                {isLoading ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (open) setError(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the category name.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !getEditCategoryError()) {
                      saveEditCategory();
                    }
                  }}
                  className={getEditCategoryError() ? "border-red-500" : ""}
                />
                {getEditCategoryError() && (
                  <p className="text-sm text-red-500">
                    {getEditCategoryError()}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={saveEditCategory}
                disabled={
                  !editingCategoryName.trim() ||
                  !!getEditCategoryError() ||
                  isLoading
                }
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
