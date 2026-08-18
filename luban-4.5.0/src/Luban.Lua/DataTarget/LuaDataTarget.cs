// Copyright 2025 Code Philosophy
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

using System.Text;
using Luban.Datas;
using Luban.DataTarget;
using Luban.Defs;
using Luban.Lua.DataVisitors;
using Luban.Utils;

namespace Luban.Lua.DataTarget;

[DataTarget("lua")]
public class LuaDataTarget : DataTargetBase
{
    private void AppendFileHeader(DefTable t, StringBuilder result)
    {
        result.AppendLine("-- ====================================================================");
        result.Append("-- 自动生成配置 :").AppendLine(t.Comment ?? " ");
        result.AppendLine("-- ====================================================================");
        result.AppendLine();

        // 添加字段结构说明
        AppendFieldStructureComment(t, result);
    }

    // 添加字段结构说明注释
    private void AppendFieldStructureComment(DefTable t, StringBuilder result)
    {
        var bean = t.ValueTType.DefBean;
        if (bean.HierarchyFields.Count == 0)
        {
            return;
        }

        result.AppendLine("--[[");
        result.AppendLine("字段结构说明:");
        result.AppendLine();

        foreach (var field in bean.HierarchyFields)
        {
            if (!field.NeedExport())
            {
                continue;
            }

            result.Append("  ").Append(field.Name);
            if (!string.IsNullOrWhiteSpace(field.Comment))
            {
                result.Append(" - ").Append(field.Comment);
            }
            result.Append(" (").Append(field.Type).Append(")");
            result.AppendLine();
        }

        result.AppendLine("--]]");
        result.AppendLine();
    }

    // 导出单例表
    public void ExportTableSingleton(DefTable t, Record record, StringBuilder result)
    {
        AppendFileHeader(t, result);
        result.Append("local M").Append(" = ").AppendLine();
        result.Append(record.Data.Apply(ToLuaFormattedVisitor.Ins, 0));
        result.AppendLine();
        result.AppendLine();
        result.Append("LOG_INFO(\"").AppendLine(" 加载完成\")");
        result.AppendLine();
        result.AppendLine("return M");
    }

    // 导出映射表
    public void ExportTableMap(DefTable t, List<Record> records, StringBuilder s)
    {
        AppendFileHeader(t, s);
        s.Append("local M = {").AppendLine();

        foreach (Record r in records)
        {
            DBean d = r.Data;
            string keyStr = d.GetField(t.Index).Apply(ToLuaLiteralVisitor.Ins);
            s.Append("    ");
            if (!keyStr.StartsWith("[", StringComparison.Ordinal))
            {
                s.Append('[').Append(keyStr).Append("] = ");
            }
            else
            {
                s.Append("[ ").Append(keyStr).Append(" ] = ");
            }
            s.Append(d.Apply(ToLuaFormattedVisitor.Ins, 1));
            s.AppendLine(",");
            s.AppendLine();
        }

        s.Append('}');
        s.AppendLine();
        s.AppendLine();
        s.Append("LOG_INFO(\"").AppendLine(" 加载完成\")");
        s.AppendLine();
        s.AppendLine("return M");
    }

    // 导出列表
    public void ExportTableList(DefTable t, List<Record> records, StringBuilder s)
    {
        AppendFileHeader(t, s);
        s.Append("local M = {").AppendLine();

        foreach (Record r in records)
        {
            DBean d = r.Data;
            s.Append("    ");
            s.Append(d.Apply(ToLuaFormattedVisitor.Ins, 1));
            s.AppendLine(",");
            s.AppendLine();
        }

        s.Append('}');
        s.AppendLine();
        s.AppendLine();
        s.Append("LOG_INFO(\"").AppendLine(" 加载完成\")");
        s.AppendLine();
        s.AppendLine("return M");
    }

    // 获取记录的注释，优先使用 name 字段，其次是 description 字段
    private string GetRecordComment(DBean bean)
    {
        // 优先使用 name 字段，其次是 description 字段
        var nameField = bean.ImplType.HierarchyFields.FirstOrDefault(f =>
            f.Name.Equals("name", StringComparison.OrdinalIgnoreCase));

        if (nameField != null)
        {
            var nameValue = bean.GetField(nameField.Name);
            if (nameValue is DString strValue && !string.IsNullOrWhiteSpace(strValue.Value))
            {
                return strValue.Value;
            }
        }

        var descField = bean.ImplType.HierarchyFields.FirstOrDefault(f =>
            f.Name.Equals("description", StringComparison.OrdinalIgnoreCase) ||
            f.Name.Equals("desc", StringComparison.OrdinalIgnoreCase));

        if (descField != null)
        {
            var descValue = bean.GetField(descField.Name);
            if (descValue is DString strValue && !string.IsNullOrWhiteSpace(strValue.Value))
            {
                return strValue.Value;
            }
        }

        return null;
    }

    protected override string DefaultOutputFileExt => "lua";

    // 导出表数据
    public override OutputFile ExportTable(DefTable table, List<Record> records)
    {
        var ss = new StringBuilder();
        if (table.IsMapTable)
        {
            ExportTableMap(table, records, ss);
        }
        else if (table.IsSingletonTable)
        {
            ExportTableSingleton(table, records[0], ss);
        }
        else
        {
            ExportTableList(table, records, ss);
        }
        return CreateOutputFile($"{table.OutputDataFile}.{OutputFileExt}", ss.ToString());
    }
}
