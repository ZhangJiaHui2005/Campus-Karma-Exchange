import prisma from "../utils/prisma.js";

const itemInclude = {
  category: true,
  owner: {
    select: {
      user_id: true,
      full_name: true,
      avatar: true,
    },
  },
};

const parsePositiveInt = (value, fallback) => {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

export const uploadItemImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Vui long chon anh" });
  }

  const image_url = `${req.protocol}://${req.get("host")}/uploads/items/${req.file.filename}`;
  return res.status(201).json({ success: true, image_url });
};

export const getMyItems = async (req, res) => {
  try {
    const status = req.query.status?.trim().toUpperCase();
    const where = {
      owner_id: req.user.user_id,
      ...(status ? { status } : {}),
    };

    const items = await prisma.item.findMany({
      where,
      include: itemInclude,
      orderBy: { created_at: "desc" },
    });

    return res.json({ success: true, items });
  } catch (error) {
    console.error("Get my items error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai vat pham cua ban" });
  }
};

export const getItems = async (req, res) => {
  try {
    const {
      q = "",
      category_id,
      type,
      status,
      location,
      min_karma,
      max_karma,
      sort = "newest",
    } = req.query;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 12), 50);

    const where = {};
    const keyword = q.trim();
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { location: { contains: keyword, mode: "insensitive" } },
      ];
    }
    if (category_id) where.category_id = Number(category_id);
    if (type) where.type = type === "SELL" ? { in: ["SELL", "EXCHANGE"] } : type;
    if (status) where.status = status;
    where.status = status || "AVAILABLE";
    if (location)
      where.location = { contains: location.trim(), mode: "insensitive" };

    if (min_karma !== undefined || max_karma !== undefined) {
      where.karma_value = {};
      if (min_karma !== undefined && min_karma !== "")
        where.karma_value.gte = Number(min_karma);
      if (max_karma !== undefined && max_karma !== "")
        where.karma_value.lte = Number(max_karma);
    }

    const orderBy = {
      newest: { created_at: "desc" },
      oldest: { created_at: "asc" },
      karma_asc: { karma_value: "asc" },
      karma_desc: { karma_value: "desc" },
    }[sort] || { created_at: "desc" };

    const [items, total] = await prisma.$transaction([
      prisma.item.findMany({
        where,
        include: itemInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return res.json({
      success: true,
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get items error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai vat pham" });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { item_id: Number(req.params.id) },
      include: itemInclude,
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Khong tim thay vat pham" });
    return res.json({ success: true, item });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Khong the tai vat pham" });
  }
};

export const createItem = async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      karma_value,
      type,
      location,
      image_url,
    } = req.body;
    const parsedCategoryId = Number(category_id);
    const parsedKarma = Number(karma_value);

    if (
      !title?.trim() ||
      !Number.isInteger(parsedCategoryId) ||
      !type?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Tieu de, danh muc va loai la bat buoc",
      });
    }
    if (!Number.isInteger(parsedKarma) || parsedKarma < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Gia tri Karma khong hop le" });
    }

    const category = await prisma.category.findUnique({
      where: { category_id: parsedCategoryId },
    });
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Danh muc khong ton tai" });

    const item = await prisma.item.create({
      data: {
        owner_id: req.user.user_id,
        category_id: parsedCategoryId,
        title: title.trim(),
        description: description?.trim() || null,
        karma_value: parsedKarma,
        type: type.trim().toUpperCase(),
        location: location?.trim() || null,
        image_url: image_url?.trim() || null,
        status: "PENDING",
      },
      include: itemInclude,
    });

    return res
      .status(201)
      .json({ success: true, message: "Dang vat pham thanh cong", item });
  } catch (error) {
    console.error("Create item error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the dang vat pham" });
  }
};

export const updateItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const existing = await prisma.item.findUnique({
      where: { item_id: itemId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Khong tim thay vat pham" });
    if (existing.owner_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: "Ban khong co quyen sua vat pham nay",
      });
    }

    const data = {};
    for (const field of [
      "title",
      "description",
      "type",
      "location",
      "image_url",
    ]) {
      if (req.body[field] !== undefined)
        data[field] = req.body[field]?.trim() || null;
    }
    if (data.type) data.type = data.type.toUpperCase();
    if (req.body.category_id !== undefined)
      data.category_id = Number(req.body.category_id);
    if (req.body.karma_value !== undefined)
      data.karma_value = Number(req.body.karma_value);

    if (
      data.karma_value !== undefined &&
      (!Number.isInteger(data.karma_value) || data.karma_value < 0)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Gia tri Karma khong hop le" });
    }

    const item = await prisma.item.update({
      where: { item_id: itemId },
      data,
      include: itemInclude,
    });
    return res.json({
      success: true,
      message: "Cap nhat vat pham thanh cong",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the cap nhat vat pham" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const existing = await prisma.item.findUnique({
      where: { item_id: itemId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Khong tim thay vat pham" });
    if (existing.owner_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: "Ban khong co quyen xoa vat pham nay",
      });
    }

    await prisma.item.delete({ where: { item_id: itemId } });
    return res.json({ success: true, message: "Da xoa vat pham" });
  } catch (error) {
    console.error("Delete item error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Khong the xoa vat pham" });
  }
};
