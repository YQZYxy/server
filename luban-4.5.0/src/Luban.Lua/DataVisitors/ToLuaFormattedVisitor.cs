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
using Luban.DataLoader;
using Luban.Datas;
using Luban.DataVisitors;
using Luban.Defs;
using Luban.Utils;

namespace Luban.Lua.DataVisitors;

public class ToLuaFormattedVisitor : IDataFuncVisitor<int, string>
{
    public static ToLuaFormattedVisitor Ins { get; } = new();

    private string GetIndent(int level)
    {
        return new string(' ', level * 4);
    }

    public string Accept(DBool type, int level)
    {
        return type.Value ? "true" : "false";
    }

    public string Accept(DByte type, int level)
    {
        return type.Value.ToString();
    }

    public string Accept(DShort type, int level)
    {
        return type.Value.ToString();
    }

    public string Accept(DInt type, int level)
    {
        return type.Value.ToString();
    }

    public string Accept(DLong type, int level)
    {
        return type.Value.ToString();
    }

    public string Accept(DFloat type, int level)
    {
        return type.Value.ToString("0.0###");
    }

    public string Accept(DDouble type, int level)
    {
        return type.Value.ToString("0.0###");
    }

    public string Accept(DEnum type, int level)
    {
        return type.Value.ToString();
    }

    public string Accept(DString type, int level)
    {
        return DataUtil.EscapeLuaStringWithQuote(type.Value);
    }

    public string Accept(DDateTime type, int level)
    {
        return $"\"{type.ToFormatString()}\"";
    }

    public string Accept(DBean type, int level)
    {
        var x = new StringBuilder();
        string indent = GetIndent(level);
        string innerIndent = GetIndent(level + 1);

        x.Append('{');
        if (type.Type.IsAbstractType)
        {
            x.Append($" {FieldNames.LuaTypeNameKey} = '{DataUtil.GetImplTypeName(type)}',");
        }
        x.AppendLine();

        int index = 0;
        foreach (var f in type.Fields)
        {
            var defField = (DefField)type.ImplType.HierarchyFields[index++];
            if (f == null || !defField.NeedExport())
            {
                continue;
            }

            x.Append(innerIndent).Append(defField.Name).Append(" = ");
            x.Append(f.Apply(this, level + 1));
            x.AppendLine(",");
        }

        x.Append(indent).Append('}');
        return x.ToString();
    }

    public string Accept(DArray type, int level)
    {
        return FormatCollection(type.Datas, level);
    }

    public string Accept(DList type, int level)
    {
        return FormatCollection(type.Datas, level);
    }

    public string Accept(DSet type, int level)
    {
        return FormatCollection(type.Datas, level);
    }

    private string FormatCollection(List<DType> datas, int level)
    {
        if (datas.Count == 0)
        {
            return "{}";
        }

        // 简单类型保持单行
        bool isSimpleType = datas.Count > 0 && !(datas[0] is DBean || datas[0] is DArray || datas[0] is DList || datas[0] is DMap);
        if (isSimpleType && datas.Count <= 10)
        {
            var x = new StringBuilder();
            x.Append("{ ");
            foreach (var e in datas)
            {
                x.Append(e.Apply(this, level));
                x.Append(", ");
            }
            x.Append('}');
            return x.ToString();
        }

        // 复杂类型或大数组多行显示
        var sb = new StringBuilder();
        string indent = GetIndent(level);
        string innerIndent = GetIndent(level + 1);

        sb.Append('{').AppendLine();
        foreach (var e in datas)
        {
            sb.Append(innerIndent);
            sb.Append(e.Apply(this, level + 1));
            sb.AppendLine(",");
        }
        sb.Append(indent).Append('}');
        return sb.ToString();
    }

    public string Accept(DMap type, int level)
    {
        if (type.DataMap.Count == 0)
        {
            return "{}";
        }

        var x = new StringBuilder();
        string indent = GetIndent(level);
        string innerIndent = GetIndent(level + 1);

        x.Append('{').AppendLine();
        foreach (var e in type.DataMap)
        {
            x.Append(innerIndent);
            x.Append('[');
            x.Append(e.Key.Apply(this, level + 1));
            x.Append("] = ");
            x.Append(e.Value.Apply(this, level + 1));
            x.AppendLine(",");
        }
        x.Append(indent).Append('}');
        return x.ToString();
    }
}
