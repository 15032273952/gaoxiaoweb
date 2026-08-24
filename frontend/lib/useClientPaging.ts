"use client";

/**
 * 客户端列表分页：输入全部条目与当前页号，返回分页元数据与当前页切片。
 * 静态导出下列表过滤在浏览器进行，翻页用查询参数驱动（见 Pagination）。
 */

import { useMemo } from "react";

export function useClientPaging<T>(items: T[], page: number, pageSize: number) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize);
    return { totalPages, safePage, slice };
  }, [items, page, pageSize]);
}
