"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConfirmDialog from "../components/ConfirmDialog";
import AdminIcon from "../components/AdminIcon";
import { api, createCategory, createProduct, createSubCategory, deleteCategory, deleteProduct, deleteSubCategory, getCategories, getProducts, getRegisteredUsers, getSubCategories, unwrap, updateCategory, updateProduct, updateSubCategory } from "../lib/api";
import DashboardOverview from "./DashboardOverview";
import EntityPage from "./EntityPage";
import CategoryFormDialog from "./CategoryFormDialog";
import SubCategoryFormDialog from "./SubCategoryFormDialog";
import ProductFormDialog from "./ProductFormDialog";
import PriceCalculatorPage from "./PriceCalculatorPage";
import ProductDetailPage from "./ProductDetailPage";
import ProductPage from "./ProductPage";
import RateFormDialog from "./RateFormDialog";
import RatesPage from "./RatesPage";
import UsersPage from "./UsersPage";
import { idOf, labelOf, slugify } from "./types";
import type { Entity, Product, Rates } from "./types";
import type { RegisteredUser } from "../lib/api";

const fallbackCategories: Entity[] = [
  { _id: "gold", name: "Gold", description: "Fine gold jewellery" },
  { _id: "silver", name: "Silver", description: "Handcrafted silver jewellery" },
];

const fallbackSubcategories: Entity[] = [
  { _id: "women", name: "Women", category: fallbackCategories[0], description: "Jewellery for women" },
  { _id: "men", name: "Men", category: fallbackCategories[0] },
  { _id: "kids", name: "Kids", category: fallbackCategories[1] },
  { _id: "devotional", name: "Devotional", category: fallbackCategories[0] },
];

const fallbackProducts: Product[] = [
  { _id: "p1", name: "Eternal Bloom Necklace", price: 142680, category: fallbackCategories[0], subCategory: fallbackSubcategories[0], purity: "22K", netWeight: 18.42, size: "Adjustable", filters: ["Female"] },
  { _id: "p2", name: "Heritage Signet Ring", price: 56940, category: fallbackCategories[0], subCategory: fallbackSubcategories[1], purity: "18K", netWeight: 8.6, size: "18", filters: ["Male"] },
  { _id: "p3", name: "Celestial Jhumka", price: 94220, category: fallbackCategories[0], subCategory: fallbackSubcategories[0], purity: "22K", netWeight: 12.18, size: "Standard", filters: ["Female"] },
];

const nav = ["Dashboard", "Products", "Categories", "Subcategories", "Metal rates", "Price calculator"] as const;

function SidebarIcon({ name }: { name: typeof nav[number] | "Users" }) {
  const paths: Record<typeof name, string> = { Dashboard: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z", Products: "M5 3h10l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm9 0v5h5M7 13h10M7 17h7", Categories: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z", Subcategories: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 4h6M9 12h6M9 16h4", "Metal rates": "M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4Zm-3 9h6M12 9v6", "Price calculator": "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 4h8M8 11h2m4 0h2M8 15h2m4 0h2", Users: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export default function DashboardApp() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Entity[]>(fallbackCategories);
  const [subcategories, setSubcategories] = useState<Entity[]>(fallbackSubcategories);
  const [rates, setRates] = useState<Rates>({ gold24K: 7412, silverPerGram: 92.4 });
  const [history, setHistory] = useState<Rates[]>([]);
  const [status, setStatus] = useState("Connecting to catalogue API");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<Entity | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [subcategoryDraft, setSubcategoryDraft] = useState<Entity | null>(null);
  const [savingSubcategory, setSavingSubcategory] = useState(false);
  const [subcategoryDeleteTarget, setSubcategoryDeleteTarget] = useState<Entity | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productDraft, setProductDraft] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productDeleteTarget, setProductDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [savingRates, setSavingRates] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productSubcategoryFilter, setProductSubcategoryFilter] = useState("");
  const [productDateSort, setProductDateSort] = useState("");
  const [productPriceRange, setProductPriceRange] = useState("");
  const [productPurityFilter, setProductPurityFilter] = useState("");
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const refresh = async () => {
    try {
      const [p, c, s, r, h] = await Promise.all([
        api<unknown>("/products"),
        api<unknown>("/categories"),
        api<unknown>("/subcategories"),
        api<Rates>("/rates"),
        api<unknown>("/historical-rates"),
      ]);
      const loadedCategories = unwrap<Entity>(c);
      setProducts(unwrap<Product>(p));
      setCategories(loadedCategories);
      setSubcategories(unwrap<Entity>(s).map(item => ({
        ...item,
        category: typeof item.category === "string" ? loadedCategories.find(category => idOf(category) === item.category) ?? item.category : item.category,
      })));
      if (r) setRates(r);
      setHistory(unwrap<Rates>(h));
      setStatus("Live API connected");
    } catch {
      setStatus("Preview data shown” API server unavailable");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (active !== "Users") return;
    let cancelled = false;
    setUsersLoading(true);
    setUsersError("");
    getRegisteredUsers()
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((error: unknown) => { if (!cancelled) setUsersError(error instanceof Error ? error.message : "Unable to load registered users"); })
      .finally(() => { if (!cancelled) setUsersLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  const productResults = useMemo(
    () => products.filter(product => product.name.toLowerCase().includes(search.toLowerCase()) || labelOf(product.category).toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  const updateRates = async (value: Rates) => {
    setSavingRates(true);
    try {
      const response = await api<Rates>("/rates", {
        method: "PUT",
        body: JSON.stringify(value),
      });
      setRates(response);
      setHistory(prev => [{ ...response, date: new Date().toISOString() }, ...prev]);
      setShowRateDialog(false);
      notify("Today’s metal rates updated");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update rates");
    } finally {
      setSavingRates(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("aurelia_admin_token");
    window.localStorage.removeItem("aurelia_admin_role");
    router.replace("/login");
  };

  const openCategoryDialog = (item?: Entity | null) => {
    setCategoryDraft(item ?? null);
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (payload: { name: string; description: string; slug: string }) => {
    setSavingCategory(true);
    try {
      const safePayload = { name: payload.name, description: payload.description, slug: payload.slug || slugify(payload.name) };
      if (categoryDraft && idOf(categoryDraft)) {
        await updateCategory(idOf(categoryDraft), safePayload);
        notify("Category updated");
      } else {
        await createCategory(safePayload);
        notify("Category added");
      }
      setCategories(await getCategories());
      setShowCategoryModal(false);
      setCategoryDraft(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save category");
    } finally {
      setSavingCategory(false);
    }
  };

  const openSubcategoryDialog = (item?: Entity | null) => {
    setSubcategoryDraft(item ?? null);
    setShowSubcategoryModal(true);
  };

  const handleSubcategorySubmit = async (payload: { name: string; description: string; image: string }) => {
    setSavingSubcategory(true);
    try {
      const safePayload = { name: payload.name, description: payload.description, image: payload.image };
      if (subcategoryDraft && idOf(subcategoryDraft)) {
        await updateSubCategory(idOf(subcategoryDraft), safePayload);
        notify("Subcategory updated");
      } else {
        await createSubCategory(safePayload);
        notify("Subcategory added");
      }
      setSubcategories(await getSubCategories());
      setShowSubcategoryModal(false);
      setSubcategoryDraft(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save subcategory");
    } finally {
      setSavingSubcategory(false);
    }
  };


  const openProductDialog = (item?: Product | null) => {
    setProductDraft(item ?? null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (payload: { name: string; description: string; size: string; price: number; category: string; subCategory: string; purity: string; netWeight: number; filters: string[]; displayImage: string; additionalImages: string[] }) => {
    setSavingProduct(true);
    try {
      if (productDraft && idOf(productDraft)) {
        await updateProduct(idOf(productDraft), payload);
        notify("Product updated");
      } else {
        await createProduct(payload);
        notify("Product added");
      }
      setProducts(await getProducts());
      setShowProductModal(false);
      setProductDraft(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteCategory = async (item: Entity) => {
    setDeleteTarget(item);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget || !idOf(deleteTarget)) return;
    setDeletingCategory(true);
    try {
      await deleteCategory(idOf(deleteTarget));
      setCategories(await getCategories());
      notify("Category deleted");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete category");
    } finally {
      setDeletingCategory(false);
      setDeleteTarget(null);
    }
  };
  const handleDeleteProduct = async (item: Product) => {
    setProductDeleteTarget(item);
  };

  const confirmDeleteProduct = async () => {
    if (!productDeleteTarget) return;
    const itemId = idOf(productDeleteTarget);
    if (!itemId) {
      setProductDeleteTarget(null);
      return;
    }

    setDeletingProduct(true);
    try {
      await deleteProduct(itemId);
      const nextProducts = await getProducts();
      setProducts(nextProducts);
      notify("Product deleted");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete product");
    } finally {
      setDeletingProduct(false);
      setProductDeleteTarget(null);
    }
  };

  const handleDeleteSubcategory = async (item: Entity) => {
    setSubcategoryDeleteTarget(item);
  };

  const confirmDeleteSubcategory = async () => {
    if (!subcategoryDeleteTarget) return;
    const itemId = idOf(subcategoryDeleteTarget);
    if (!itemId) {
      setSubcategoryDeleteTarget(null);
      return;
    }

    setDeletingSubcategory(true);
    try {
      await deleteSubCategory(itemId);
      setSubcategories(await getSubCategories());
      notify("Subcategory deleted");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to delete subcategory");
    } finally {
      setDeletingSubcategory(false);
      setSubcategoryDeleteTarget(null);
    }
  };

  return (
    <main className="admin">
      <aside className="side">
        <div className="brand">
          <Image className="brand-logo" src="/images/logo.png" alt="Bedekar Jewellers" width={35} height={35} />
          <span>
            <b>BEDEKAR</b>
            <small>FINE JEWELS</small>
          </span>
        </div>

        <div className="store">
          <Image className="store-logo" src="/images/logo.png" alt="Bedekar Jewellers" width={29} height={29} />
          <span>
            <b>Bedekar Jewels</b>
            <small>Flagship Store</small>
          </span>
          <em><AdminIcon name="sparkle" /> </em>
        </div>

        <nav>
          {nav.map((name) => (
            <button key={name} className={active === name ? "selected" : ""} onClick={() => setActive(name)}>
              <span className="nav-icon"><SidebarIcon name={name} /></span>
              {name}
            </button>
          ))}
          <button className={active === "Users" ? "selected" : ""} onClick={() => setActive("Users")}>
            <span className="nav-icon"><SidebarIcon name="Users" /></span>
            Users
          </button>
        </nav>

        <div className="sidefoot">
          <div className="sidefoot-status">
            <span className="api-dot" />
            <span className="status-text">{status}</span>
          </div>

          <div className="sidefoot-card">
            <div className="profile">
              <i>AS</i>
              <div className="profile-info">
                <b>Pranav Bedekar</b>
                <small>Administrator</small>
              </div>
            </div>

            <div className="sidefoot-actions">
              <button
                type="button"
                className="sidefoot-btn"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => notify("No new notifications")}
              >
                <AdminIcon name="bell" size={16} />
                <span className="notification-dot" />
              </button>
              <button
                type="button"
                className="sidefoot-btn logout"
                title="Sign out"
                aria-label="Sign out"
                onClick={() => setShowLogoutModal(true)}
              >
                <AdminIcon name="logout" size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section className="area">
        <div className="body">
          {active === "Dashboard" && <DashboardOverview products={products} rates={rates} onNavigate={setActive} />}
          {active === "Products" && !selectedProduct && (
            <ProductPage
              products={productResults}
              categories={categories}
              subcategories={subcategories}
              search={search}
              setSearch={setSearch}
              categoryFilter={productCategoryFilter}
              setCategoryFilter={setProductCategoryFilter}
              subcategoryFilter={productSubcategoryFilter}
              setSubcategoryFilter={setProductSubcategoryFilter}
              dateSort={productDateSort}
              setDateSort={setProductDateSort}
              priceRange={productPriceRange}
              setPriceRange={setProductPriceRange}
              purityFilter={productPurityFilter}
              setPurityFilter={setProductPurityFilter}
              onAdd={() => openProductDialog(null)}
              onView={(product) => setSelectedProduct(product)}
              onEdit={openProductDialog}
              onDelete={handleDeleteProduct}
            />
          )}
          {active === "Products" && selectedProduct && (
            <ProductDetailPage product={selectedProduct} onBack={() => setSelectedProduct(null)} />
          )}
          {active === "Categories" && (
            <EntityPage
              title="Metals"
              subtitle="Organise the metal collections in your store."
              items={categories}
              related={subcategories}
              categoryMode={false}
              onAdd={() => openCategoryDialog(null)}
              onEdit={(item) => openCategoryDialog(item)}
              onDelete={handleDeleteCategory}
            />
          )}
          {active === "Subcategories" && (
            <EntityPage
              title="Jewellery Types"
              subtitle="Manage Men, Women, Kids and Devotional collections."
              items={subcategories}
              categoryMode
              onAdd={() => openSubcategoryDialog(null)}
              onEdit={(item) => openSubcategoryDialog(item)}
              onDelete={handleDeleteSubcategory}
            />
          )}
          {active === "Users" && <UsersPage users={users} search={userSearch} onSearch={setUserSearch} loading={usersLoading} error={usersError} />}
          {active === "Metal rates" && <RatesPage rates={rates} history={history} onUpdate={() => setShowRateDialog(true)} />}
          {active === "Price calculator" && <PriceCalculatorPage rates={rates} />}
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
      {toast && <div className="toast-notice" role="status"><AdminIcon name="check" />{toast}</div>}

      <CategoryFormDialog
        open={showCategoryModal}
        category={categoryDraft}
        loading={savingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryDraft(null);
        }}
        onSubmit={handleCategorySubmit}
      />

      <SubCategoryFormDialog
        open={showSubcategoryModal}
        subCategory={subcategoryDraft}
        loading={savingSubcategory}
        onClose={() => {
          setShowSubcategoryModal(false);
          setSubcategoryDraft(null);
        }}
        onSubmit={handleSubcategorySubmit}
      />

      <ProductFormDialog
        open={showProductModal}
        product={productDraft}
        categories={categories}
        subcategories={subcategories}
        loading={savingProduct}
        onClose={() => {
          setShowProductModal(false);
          setProductDraft(null);
        }}
        onSubmit={handleProductSubmit}
      />

      <ConfirmDialog
        open={Boolean(productDeleteTarget)}
        title="Delete product"
        message={productDeleteTarget ? `Are you sure you want to delete ${productDeleteTarget.name ?? "this product"}? This action cannot be undone.` : "Are you sure you want to delete this product?"}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deletingProduct}
        destructive
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          setProductDeleteTarget(null);
          setDeletingProduct(false);
        }}
      />

      <RateFormDialog
        open={showRateDialog}
        loading={savingRates}
        initialValues={rates}
        onClose={() => setShowRateDialog(false)}
        onSubmit={updateRates}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name ?? "this category"}? This action cannot be undone.` : "Are you sure you want to delete this category?"}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deletingCategory}
        destructive
        onConfirm={confirmDeleteCategory}
        onCancel={() => {
          setDeleteTarget(null);
          setDeletingCategory(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(subcategoryDeleteTarget)}
        title="Delete subcategory"
        message={subcategoryDeleteTarget ? `Are you sure you want to delete ${subcategoryDeleteTarget.name ?? "this subcategory"}? This action cannot be undone.` : "Are you sure you want to delete this subcategory?"}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deletingSubcategory}
        destructive
        onConfirm={confirmDeleteSubcategory}
        onCancel={() => {
          setSubcategoryDeleteTarget(null);
          setDeletingSubcategory(false);
        }}
      />

      {showLogoutModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,16,12,0.52)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{ width: "min(440px, calc(100vw - 32px))", background: "#fff", border: "1px solid #eadfc9", borderRadius: 18, padding: "22px 20px", boxShadow: "0 22px 55px rgba(26,17,6,0.22)" }}
            onClick={event => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", color: "#2d231d" }}>Confirm logout</h3>
              <button style={{ border: 0, background: "#f5eee8", color: "#6a5850", width: 32, height: 32, borderRadius: "50%", fontSize: 22, lineHeight: 1 }} onClick={() => setShowLogoutModal(false)}><AdminIcon name="close" /></button>
            </div>
            <p style={{ margin: "0 0 20px", color: "#655e57", lineHeight: 1.6 }}>Are you sure you want to sign out of the admin panel?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                style={{ background: "#f3efe9", border: "1px solid #e1d4bc", color: "#554b40", borderRadius: 10, padding: "10px 16px", fontWeight: 600 }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ border: 0, padding: "12px 18px", borderRadius: 10, background: "linear-gradient(135deg, #d6ad63, #b77d32)", color: "#fff", fontWeight: 600, boxShadow: "0 10px 24px rgba(159,110,41,.2)" }}
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}







