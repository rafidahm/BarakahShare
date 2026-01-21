# Complete Status Summary - Donation & Lending

## 📋 Table of Contents
1. [Donation Flow](#donation-flow)
2. [Lending Flow](#lending-flow)
3. [Status Badge Colors](#status-badge-colors)

---

## 🎁 Donation Flow

### **Donor's View (User Request Page)**

| Item Status | Request Status | Summary Display | Action Buttons | Dates Shown |
|-------------|----------------|-----------------|----------------|-------------|
| **AVAILABLE** | Pending | No summary (shows pending request cards with Approve/Decline buttons) | Approve / Decline | - |
| **CLAIMED** | On Hold | **Donation Summary**<br>Status: APPROVED<br>Donated by: You<br>Recipient: [Name] | "Confirm Handover" | Approved on |
| **COMPLETED** | Claimed | **Donation Summary**<br>Status: ✅ COMPLETED<br>Donated by: You<br>Recipient: [Name] | None | Approved on<br>Donated on |

---

### **Recipient's View (My Requests Page)**

| Request Status | Badge Color | Message | Action Buttons | Dates Shown |
|----------------|-------------|---------|----------------|-------------|
| **Pending** | 🟡 Yellow | "Waiting for owner approval..." | None | Requested on |
| **On Hold** | 🟠 Orange | "⏳ Your request is ON HOLD. Waiting for the owner to confirm handover." | None | Requested on<br>Approved on |
| **Claimed** | 🟢 Green | "✅ Item CLAIMED! The donation is complete." | None | Requested on<br>Approved on<br>Claimed on |
| **Rejected** | 🔴 Red | "Unfortunately, your request was not approved this time. The owner may have chosen another recipient..." | None | Requested on<br>Rejected on |

---

## 📦 Lending Flow

### **Lender's View (User Request Page)**

| Item Status | Request Status | Summary Display | Action Buttons | Dates Shown |
|-------------|----------------|-----------------|----------------|-------------|
| **AVAILABLE** | Pending | No summary (shows pending request cards with Approve/Decline buttons) | Approve / Decline | - |
| **CLAIMED** | Approved | **Lending Summary**<br>Status: CLAIMED<br>Lent by: You<br>Borrowed by: [Name] | "Waiting for Borrower to Confirm Receipt" (disabled) | Approved on |
| **IN_USE** | In Use | **Lending Summary**<br>Status: IN USE<br>Lent by: You<br>Borrowed by: [Name] | Info box: "Item is currently with borrower. Waiting for them to mark as returned." | Approved on<br>Lent on |
| **PENDING_RETURN** | Pending Return | **Lending Summary**<br>Status: ⏳ PENDING RETURN<br>Lent by: You<br>Borrowed by: [Name] | "Confirm Return" | Approved on<br>Lent on |
| **RETURNED** | Returned | **Lending Summary**<br>Status: ✅ RETURNED<br>Lent by: You<br>Borrowed by: [Name] | None | Approved on<br>Lent on<br>Returned on |

---

### **Borrower's View (My Requests Page)**

| Request Status | Badge Color | Message | Action Buttons | Dates Shown |
|----------------|-------------|---------|----------------|-------------|
| **Pending** | 🟡 Yellow | "Waiting for owner approval..." | None | Requested on |
| **Approved** | 🟢 Green | "✅ Your request is approved! Please pick up the item and confirm receipt." | "I Received It" | Requested on<br>Approved on |
| **In Use** | 🔵 Blue | "📦 You currently have this item. Click below when you return it." | "I Returned It" | Requested on<br>Approved on<br>Lent on |
| **Pending Return** | 🟠 Orange | "⏳ Waiting for lender to confirm they received the item back. The owner will verify the return and update the status." | None (waiting) | Requested on<br>Approved on<br>Lent on |
| **Returned** | 🟩 Teal | "✅ Return confirmed! Thank you for returning on time." | None | Requested on<br>Approved on<br>Lent on<br>Returned on |
| **Rejected** | 🔴 Red | "Unfortunately, your request was not approved this time..." | None | Requested on<br>Rejected on |

---

## 🎨 Status Badge Colors

| Status | Color | Emoji | Usage |
|--------|-------|-------|-------|
| **Pending** | Yellow (`bg-yellow-100 text-yellow-800`) | - | Initial request state |
| **Approved** | Green (`bg-green-100 text-green-800`) | - | Lending: approved, waiting for pickup |
| **On Hold** | Orange (`bg-orange-100 text-orange-800`) | ⏳ | Donation: approved, waiting for handover |
| **In Use** | Blue (`bg-blue-100 text-blue-800`) | - | Lending: borrower has the item |
| **Pending Return** | Orange (`bg-orange-100 text-orange-800`) | ⏳ | Lending: borrower claims return, waiting for lender confirmation |
| **Claimed** | Green (`bg-green-100 text-green-800`) | - | Donation: handover complete |
| **Completed** | Purple (`bg-purple-100 text-purple-800`) | ✅ | Donation: fully completed |
| **Returned** | Teal (`bg-teal-100 text-teal-800`) | ✅ | Lending: return confirmed |
| **Rejected** | Red (`bg-red-100 text-red-800`) | - | Request denied |

---

## 🔄 Complete User Journeys

### **Donation Journey**

#### **From Donor's Perspective:**
```
1. User requests item
   → See pending request card with Approve/Decline buttons

2. Click "Approve Donation"
   → Item Status: CLAIMED
   → Request Status: On Hold
   → Summary shows: Recipient info, "Approved on" date
   → Button: "Confirm Handover"

3. Click "Confirm Handover"
   → Item Status: COMPLETED
   → Request Status: Claimed
   → Summary shows: ✅ COMPLETED, "Approved on" + "Donated on"
   → No buttons (complete)
```

#### **From Recipient's Perspective:**
```
1. Make request
   → Badge: 🟡 PENDING
   → Message: "Waiting for owner approval..."

2. Owner approves
   → Badge: 🟠 ⏳ ON HOLD
   → Message: "Waiting for owner to confirm handover"
   → Shows: "Approved on" date

3. Owner confirms handover
   → Badge: 🟢 CLAIMED
   → Message: "✅ Item CLAIMED! The donation is complete."
   → Shows: "Approved on" + "Claimed on" dates
```

---

### **Lending Journey**

#### **From Lender's Perspective:**
```
1. User requests item
   → See pending request card with Approve/Decline buttons

2. Click "Approve"
   → Item Status: CLAIMED
   → Request Status: Approved
   → Summary shows: Borrower info, "Approved on" date
   → Button: "Waiting for Borrower to Confirm Receipt" (disabled)

3. Borrower clicks "I Received It"
   → Item Status: IN_USE
   → Request Status: In Use
   → Summary shows: IN USE status, "Approved on" + "Lent on"
   → Info box: "Waiting for them to mark as returned"

4. Borrower clicks "I Returned It"
   → Item Status: PENDING_RETURN
   → Request Status: Pending Return
   → Summary shows: ⏳ PENDING RETURN, all dates
   → Button: "Confirm Return"

5. Click "Confirm Return"
   → Item Status: RETURNED
   → Request Status: Returned
   → Summary shows: ✅ RETURNED, all dates
   → No buttons (complete)
```

#### **From Borrower's Perspective:**
```
1. Make request
   → Badge: 🟡 PENDING
   → Message: "Waiting for owner approval..."

2. Owner approves
   → Badge: 🟢 CLAIMED (shows as APPROVED)
   → Message: "✅ Your request is approved! Please pick up..."
   → Button: "I Received It"
   → Shows: "Approved on" date

3. Click "I Received It"
   → Badge: 🔵 IN USE
   → Message: "📦 You currently have this item..."
   → Button: "I Returned It"
   → Shows: "Approved on" + "Lent on"

4. Click "I Returned It"
   → Badge: 🟠 ⏳ PENDING RETURN
   → Message: "⏳ Waiting for lender to confirm..."
   → No button (waiting)
   → Shows: "Approved on" + "Lent on"

5. Lender confirms return
   → Badge: 🟩 RETURNED
   → Message: "✅ Return confirmed! Thank you..."
   → No button (complete)
   → Shows: "Approved on" + "Lent on" + "Returned on"
```

---

## 📊 Quick Reference Matrix

### **Who Can Do What?**

| Action | Donor/Lender | Recipient/Borrower |
|--------|--------------|-------------------|
| **Approve Request** | ✅ Yes | ❌ No |
| **Reject Request** | ✅ Yes | ❌ No |
| **Confirm Handover (Donation)** | ✅ Yes | ❌ No |
| **Mark as Received (Lending)** | ❌ No | ✅ Yes |
| **Mark as Returned (Lending)** | ❌ No | ✅ Yes |
| **Confirm Return (Lending)** | ✅ Yes | ❌ No |

---

## 🎯 Key Differences

### **Donation vs Lending:**

| Aspect | Donation | Lending |
|--------|----------|---------|
| **Statuses** | AVAILABLE → CLAIMED → COMPLETED | AVAILABLE → CLAIMED → IN_USE → PENDING_RETURN → RETURNED |
| **Intermediate Status** | On Hold (waiting for handover) | Approved (waiting for pickup) |
| **Recipient Action** | None (passive) | Active ("I Received It", "I Returned It") |
| **Final Status** | COMPLETED (one-way) | RETURNED (item comes back) |
| **Mutual Confirmation** | No (donor controls everything) | Yes (both parties confirm) |

---

**This is the complete reference for all statuses in the BarakahShare system!** 🎓
