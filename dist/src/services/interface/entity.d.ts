export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export interface User extends BaseEntity {
    email: string;
    username: string;
    displayName: string;
    avatar?: string;
    familyMemberships: FamilyMember[];
    ownedFamilies: Family[];
}
export interface Family extends BaseEntity {
    name: string;
    description?: string;
    inviteCode: string;
    ownerId: string;
    owner: User;
    members: FamilyMember[];
}
export interface FamilyMember {
    id: string;
    role: FamilyRole;
    permissions: string[];
    joinedAt: Date;
    isActive: boolean;
    userId: string;
    user: User;
    familyId: string;
    family: Family;
    totalPoints: number;
}
export declare enum FamilyRole {
    ADMIN = "ADMIN",
    PARENT = "PARENT",
    CHILD = "CHILD",
    GUEST = "GUEST"
}
export interface CalendarEvent extends BaseEntity {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurrenceType?: RecurrenceType;
    recurrenceEnd?: Date;
    color?: string;
    creatorId: string;
    creator: User;
    familyId: string;
    family: Family;
    attendees: EventAttendee[];
}
export interface EventAttendee {
    id: string;
    status: 'pending' | 'accepted' | 'declined';
    eventId: string;
    event: CalendarEvent;
    userId: string;
    user: User;
}
export declare enum RecurrenceType {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export interface TaskList extends BaseEntity {
    name: string;
    description?: string;
    color?: string;
    familyId: string;
    family: Family;
    tasks: Task[];
}
export interface Task extends BaseEntity {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    completedAt?: Date;
    taskListId: string;
    taskList: TaskList;
    creatorId: string;
    creator: User;
    assigneeId?: string;
    assignee?: User;
    familyId: string;
    family: Family;
    subTasks: SubTask[];
    attachments: TaskAttachment[];
}
export interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
    order: number;
    taskId: string;
    task: Task;
}
export interface TaskAttachment {
    id: string;
    filename: string;
    fileUrl: string;
    fileType: string;
    taskId: string;
    task: Task;
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export interface Chore extends BaseEntity {
    name: string;
    description?: string;
    frequency: ChoreFrequency;
    points: number;
    familyId: string;
    family: Family;
    assignments: ChoreAssignment[];
}
export interface ChoreAssignment {
    id: string;
    dueDate: Date;
    completed: boolean;
    completedAt?: Date;
    pointsEarned: number;
    choreId: string;
    chore: Chore;
    assigneeId: string;
    assignee: User;
}
export declare enum ChoreFrequency {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}
export interface GroceryList extends BaseEntity {
    name: string;
    description?: string;
    familyId: string;
    family: Family;
    items: GroceryItem[];
}
export interface GroceryItem extends BaseEntity {
    name: string;
    quantity?: string;
    notes?: string;
    status: GroceryStatus;
    category?: string;
    estimatedPrice?: number;
    listId: string;
    list: GroceryList;
    addedById: string;
    addedBy: User;
}
export declare enum GroceryStatus {
    NEEDED = "NEEDED",
    IN_CART = "IN_CART",
    PURCHASED = "PURCHASED"
}
export interface Recipe extends BaseEntity {
    title: string;
    description?: string;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    difficulty: DifficultyLevel;
    category: RecipeCategory;
    tags: string[];
    imageUrl?: string;
    rating?: number;
    creatorId: string;
    creator: User;
    familyId: string;
    family: Family;
    mealPlanEntries: MealPlanEntry[];
}
export interface RecipeIngredient {
    name: string;
    quantity: string;
    unit: string;
    notes?: string;
}
export interface RecipeInstruction {
    step: number;
    text: string;
    imageUrl?: string;
}
export declare enum RecipeCategory {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    SNACK = "SNACK",
    DESSERT = "DESSERT",
    APPETIZER = "APPETIZER",
    DRINK = "DRINK"
}
export declare enum DifficultyLevel {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    EXPERT = "EXPERT"
}
export interface MealPlan extends BaseEntity {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    creatorId: string;
    creator: User;
    familyId: string;
    family: Family;
    entries: MealPlanEntry[];
}
export interface MealPlanEntry {
    id: string;
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    notes?: string;
    mealPlanId: string;
    mealPlan: MealPlan;
    recipeId: string;
    recipe: Recipe;
}
export interface ShoppingList extends BaseEntity {
    name: string;
    description?: string;
    store?: string;
    budget?: number;
    isCompleted: boolean;
    completedAt?: Date;
    creatorId: string;
    creator: User;
    familyId: string;
    family: Family;
    items: ShoppingItem[];
}
export interface ShoppingItem {
    id: string;
    name: string;
    quantity?: string;
    price?: number;
    purchased: boolean;
    purchasedAt?: Date;
    notes?: string;
    category?: string;
    listId: string;
    list: ShoppingList;
    addedById: string;
    addedBy: User;
}
export interface PointTransaction {
    id: string;
    points: number;
    type: PointTransactionType;
    reason: string;
    metadata?: any;
    createdAt: Date;
    userId: string;
    user: User;
    familyId: string;
    family: Family;
}
export interface Reward extends BaseEntity {
    name: string;
    description?: string;
    pointsCost: number;
    imageUrl?: string;
    quantity?: string;
    status: RewardStatus;
    familyId: string;
    family: Family;
    claimedBy: User[];
}
export declare enum PointTransactionType {
    EARNED = "EARNED",
    SPENT = "SPENT",
    BONUS = "BONUS",
    PENALTY = "PENALTY"
}
export declare enum RewardStatus {
    AVAILABLE = "AVAILABLE",
    CLAIMED = "CLAIMED",
    REDEEMED = "REDEEMED",
    EXPIRED = "EXPIRED"
}
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: any;
    createdAt: Date;
    userId: string;
    user: User;
    eventId?: string;
    event?: CalendarEvent;
}
export interface NotificationToken {
    id: string;
    token: string;
    device?: string;
    isActive: boolean;
    createdAt: Date;
    userId: string;
    user: User;
}
export declare enum NotificationType {
    EVENT_REMINDER = "EVENT_REMINDER",
    TASK_DUE = "TASK_DUE",
    TASK_ASSIGNED = "TASK_ASSIGNED",
    MEAL_PLAN_REMINDER = "MEAL_PLAN_REMINDER",
    POINTS_EARNED = "POINTS_EARNED",
    REWARD_AVAILABLE = "REWARD_AVAILABLE",
    SHOPPING_REMINDER = "SHOPPING_REMINDER"
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface FilterParams {
    search?: string;
    status?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
    familyId?: string;
}
export interface ListQueryParams extends PaginationParams, FilterParams {
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: ValidationError[];
}
export interface FamilyContext {
    familyId: string;
    userId: string;
    userRole: FamilyRole;
    permissions: string[];
}
