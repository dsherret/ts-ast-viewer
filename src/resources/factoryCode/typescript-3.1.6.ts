import CodeBlockWriter from "code-block-writer";

export function generateFactoryCode(ts: typeof import("typescript-3.1.6"), initialNode: import("typescript-3.1.6").Node) {
    const writer = new CodeBlockWriter({ newLine: "\n", indentNumberOfSpaces: 2 });
    const syntaxKindToName = createSyntaxKindToNameMap();

    if (ts.isSourceFile(initialNode)) {
        writer.write("[");
        if (initialNode.statements.length > 0) {
            writer.indent(() => {
                for (let i = 0; i < initialNode.statements.length; i++) {
                    const statement = initialNode.statements[i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(statement);
                }
            }).newLine();
        }
        writer.write("];");
    }
    else {
        writeNodeText(initialNode);
    }
    writer.newLineIfLastNot();

    return writer.toString();

    function writeNodeText(node: import("typescript-3.1.6").Node) {
        switch (node.kind) {
            case ts.SyntaxKind.NumericLiteral:
                createNumericLiteral(node as import("typescript-3.1.6").NumericLiteral);
                return;
            case ts.SyntaxKind.StringLiteral:
                createStringLiteral(node as import("typescript-3.1.6").StringLiteral);
                return;
            case ts.SyntaxKind.RegularExpressionLiteral:
                createRegularExpressionLiteral(node as import("typescript-3.1.6").RegularExpressionLiteral);
                return;
            case ts.SyntaxKind.Identifier:
                createIdentifier(node as import("typescript-3.1.6").Identifier);
                return;
            case ts.SyntaxKind.SuperKeyword:
                createSuper(node as import("typescript-3.1.6").SuperExpression);
                return;
            case ts.SyntaxKind.ThisKeyword:
                createThis(node as import("typescript-3.1.6").ThisExpression);
                return;
            case ts.SyntaxKind.NullKeyword:
                createNull(node as import("typescript-3.1.6").NullLiteral);
                return;
            case ts.SyntaxKind.TrueKeyword:
                createTrue(node as import("typescript-3.1.6").BooleanLiteral);
                return;
            case ts.SyntaxKind.FalseKeyword:
                createFalse(node as import("typescript-3.1.6").BooleanLiteral);
                return;
            case ts.SyntaxKind.QualifiedName:
                createQualifiedName(node as import("typescript-3.1.6").QualifiedName);
                return;
            case ts.SyntaxKind.ComputedPropertyName:
                createComputedPropertyName(node as import("typescript-3.1.6").ComputedPropertyName);
                return;
            case ts.SyntaxKind.TypeParameter:
                createTypeParameterDeclaration(node as import("typescript-3.1.6").TypeParameterDeclaration);
                return;
            case ts.SyntaxKind.Parameter:
                createParameter(node as import("typescript-3.1.6").ParameterDeclaration);
                return;
            case ts.SyntaxKind.Decorator:
                createDecorator(node as import("typescript-3.1.6").Decorator);
                return;
            case ts.SyntaxKind.PropertySignature:
                createPropertySignature(node as import("typescript-3.1.6").PropertySignature);
                return;
            case ts.SyntaxKind.PropertyDeclaration:
                createProperty(node as import("typescript-3.1.6").PropertyDeclaration);
                return;
            case ts.SyntaxKind.MethodSignature:
                createMethodSignature(node as import("typescript-3.1.6").MethodSignature);
                return;
            case ts.SyntaxKind.MethodDeclaration:
                createMethod(node as import("typescript-3.1.6").MethodDeclaration);
                return;
            case ts.SyntaxKind.Constructor:
                createConstructor(node as import("typescript-3.1.6").ConstructorDeclaration);
                return;
            case ts.SyntaxKind.GetAccessor:
                createGetAccessor(node as import("typescript-3.1.6").GetAccessorDeclaration);
                return;
            case ts.SyntaxKind.SetAccessor:
                createSetAccessor(node as import("typescript-3.1.6").SetAccessorDeclaration);
                return;
            case ts.SyntaxKind.CallSignature:
                createCallSignature(node as import("typescript-3.1.6").CallSignatureDeclaration);
                return;
            case ts.SyntaxKind.ConstructSignature:
                createConstructSignature(node as import("typescript-3.1.6").ConstructSignatureDeclaration);
                return;
            case ts.SyntaxKind.IndexSignature:
                createIndexSignature(node as import("typescript-3.1.6").IndexSignatureDeclaration);
                return;
            case ts.SyntaxKind.AnyKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.BooleanKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.NeverKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.NumberKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.ObjectKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.StringKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.SymbolKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.UndefinedKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.UnknownKeyword:
                createKeywordTypeNode(node as import("typescript-3.1.6").KeywordTypeNode);
                return;
            case ts.SyntaxKind.TypePredicate:
                createTypePredicateNode(node as import("typescript-3.1.6").TypePredicateNode);
                return;
            case ts.SyntaxKind.TypeReference:
                createTypeReferenceNode(node as import("typescript-3.1.6").TypeReferenceNode);
                return;
            case ts.SyntaxKind.FunctionType:
                createFunctionTypeNode(node as import("typescript-3.1.6").FunctionTypeNode);
                return;
            case ts.SyntaxKind.ConstructorType:
                createConstructorTypeNode(node as import("typescript-3.1.6").ConstructorTypeNode);
                return;
            case ts.SyntaxKind.TypeQuery:
                createTypeQueryNode(node as import("typescript-3.1.6").TypeQueryNode);
                return;
            case ts.SyntaxKind.TypeLiteral:
                createTypeLiteralNode(node as import("typescript-3.1.6").TypeLiteralNode);
                return;
            case ts.SyntaxKind.ArrayType:
                createArrayTypeNode(node as import("typescript-3.1.6").ArrayTypeNode);
                return;
            case ts.SyntaxKind.TupleType:
                createTupleTypeNode(node as import("typescript-3.1.6").TupleTypeNode);
                return;
            case ts.SyntaxKind.OptionalType:
                createOptionalTypeNode(node as import("typescript-3.1.6").OptionalTypeNode);
                return;
            case ts.SyntaxKind.RestType:
                createRestTypeNode(node as import("typescript-3.1.6").RestTypeNode);
                return;
            case ts.SyntaxKind.UnionType:
                createUnionTypeNode(node as import("typescript-3.1.6").UnionTypeNode);
                return;
            case ts.SyntaxKind.IntersectionType:
                createIntersectionTypeNode(node as import("typescript-3.1.6").IntersectionTypeNode);
                return;
            case ts.SyntaxKind.ConditionalType:
                createConditionalTypeNode(node as import("typescript-3.1.6").ConditionalTypeNode);
                return;
            case ts.SyntaxKind.InferType:
                createInferTypeNode(node as import("typescript-3.1.6").InferTypeNode);
                return;
            case ts.SyntaxKind.ImportType:
                createImportTypeNode(node as import("typescript-3.1.6").ImportTypeNode);
                return;
            case ts.SyntaxKind.ParenthesizedType:
                createParenthesizedType(node as import("typescript-3.1.6").ParenthesizedTypeNode);
                return;
            case ts.SyntaxKind.ThisType:
                createThisTypeNode(node as import("typescript-3.1.6").ThisTypeNode);
                return;
            case ts.SyntaxKind.TypeOperator:
                createTypeOperatorNode(node as import("typescript-3.1.6").TypeOperatorNode);
                return;
            case ts.SyntaxKind.IndexedAccessType:
                createIndexedAccessTypeNode(node as import("typescript-3.1.6").IndexedAccessTypeNode);
                return;
            case ts.SyntaxKind.MappedType:
                createMappedTypeNode(node as import("typescript-3.1.6").MappedTypeNode);
                return;
            case ts.SyntaxKind.LiteralType:
                createLiteralTypeNode(node as import("typescript-3.1.6").LiteralTypeNode);
                return;
            case ts.SyntaxKind.ObjectBindingPattern:
                createObjectBindingPattern(node as import("typescript-3.1.6").ObjectBindingPattern);
                return;
            case ts.SyntaxKind.ArrayBindingPattern:
                createArrayBindingPattern(node as import("typescript-3.1.6").ArrayBindingPattern);
                return;
            case ts.SyntaxKind.BindingElement:
                createBindingElement(node as import("typescript-3.1.6").BindingElement);
                return;
            case ts.SyntaxKind.ArrayLiteralExpression:
                createArrayLiteral(node as import("typescript-3.1.6").ArrayLiteralExpression);
                return;
            case ts.SyntaxKind.ObjectLiteralExpression:
                createObjectLiteral(node as import("typescript-3.1.6").ObjectLiteralExpression);
                return;
            case ts.SyntaxKind.PropertyAccessExpression:
                createPropertyAccess(node as import("typescript-3.1.6").PropertyAccessExpression);
                return;
            case ts.SyntaxKind.ElementAccessExpression:
                createElementAccess(node as import("typescript-3.1.6").ElementAccessExpression);
                return;
            case ts.SyntaxKind.CallExpression:
                createCall(node as import("typescript-3.1.6").CallExpression);
                return;
            case ts.SyntaxKind.NewExpression:
                createNew(node as import("typescript-3.1.6").NewExpression);
                return;
            case ts.SyntaxKind.TaggedTemplateExpression:
                createTaggedTemplate(node as import("typescript-3.1.6").TaggedTemplateExpression);
                return;
            case ts.SyntaxKind.TypeAssertionExpression:
                createTypeAssertion(node as import("typescript-3.1.6").TypeAssertion);
                return;
            case ts.SyntaxKind.ParenthesizedExpression:
                createParen(node as import("typescript-3.1.6").ParenthesizedExpression);
                return;
            case ts.SyntaxKind.FunctionExpression:
                createFunctionExpression(node as import("typescript-3.1.6").FunctionExpression);
                return;
            case ts.SyntaxKind.ArrowFunction:
                createArrowFunction(node as import("typescript-3.1.6").ArrowFunction);
                return;
            case ts.SyntaxKind.DeleteExpression:
                createDelete(node as import("typescript-3.1.6").DeleteExpression);
                return;
            case ts.SyntaxKind.TypeOfExpression:
                createTypeOf(node as import("typescript-3.1.6").TypeOfExpression);
                return;
            case ts.SyntaxKind.VoidExpression:
                createVoid(node as import("typescript-3.1.6").VoidExpression);
                return;
            case ts.SyntaxKind.AwaitExpression:
                createAwait(node as import("typescript-3.1.6").AwaitExpression);
                return;
            case ts.SyntaxKind.PrefixUnaryExpression:
                createPrefix(node as import("typescript-3.1.6").PrefixUnaryExpression);
                return;
            case ts.SyntaxKind.PostfixUnaryExpression:
                createPostfix(node as import("typescript-3.1.6").PostfixUnaryExpression);
                return;
            case ts.SyntaxKind.BinaryExpression:
                createBinary(node as import("typescript-3.1.6").BinaryExpression);
                return;
            case ts.SyntaxKind.ConditionalExpression:
                createConditional(node as import("typescript-3.1.6").ConditionalExpression);
                return;
            case ts.SyntaxKind.TemplateExpression:
                createTemplateExpression(node as import("typescript-3.1.6").TemplateExpression);
                return;
            case ts.SyntaxKind.TemplateHead:
                createTemplateHead(node as import("typescript-3.1.6").TemplateHead);
                return;
            case ts.SyntaxKind.TemplateMiddle:
                createTemplateMiddle(node as import("typescript-3.1.6").TemplateMiddle);
                return;
            case ts.SyntaxKind.TemplateTail:
                createTemplateTail(node as import("typescript-3.1.6").TemplateTail);
                return;
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                createNoSubstitutionTemplateLiteral(node as import("typescript-3.1.6").NoSubstitutionTemplateLiteral);
                return;
            case ts.SyntaxKind.YieldExpression:
                createYield(node as import("typescript-3.1.6").YieldExpression);
                return;
            case ts.SyntaxKind.SpreadElement:
                createSpread(node as import("typescript-3.1.6").SpreadElement);
                return;
            case ts.SyntaxKind.ClassExpression:
                createClassExpression(node as import("typescript-3.1.6").ClassExpression);
                return;
            case ts.SyntaxKind.OmittedExpression:
                createOmittedExpression(node as import("typescript-3.1.6").OmittedExpression);
                return;
            case ts.SyntaxKind.ExpressionWithTypeArguments:
                createExpressionWithTypeArguments(node as import("typescript-3.1.6").ExpressionWithTypeArguments);
                return;
            case ts.SyntaxKind.AsExpression:
                createAsExpression(node as import("typescript-3.1.6").AsExpression);
                return;
            case ts.SyntaxKind.NonNullExpression:
                createNonNullExpression(node as import("typescript-3.1.6").NonNullExpression);
                return;
            case ts.SyntaxKind.MetaProperty:
                createMetaProperty(node as import("typescript-3.1.6").MetaProperty);
                return;
            case ts.SyntaxKind.TemplateSpan:
                createTemplateSpan(node as import("typescript-3.1.6").TemplateSpan);
                return;
            case ts.SyntaxKind.SemicolonClassElement:
                createSemicolonClassElement(node as import("typescript-3.1.6").SemicolonClassElement);
                return;
            case ts.SyntaxKind.Block:
                createBlock(node as import("typescript-3.1.6").Block);
                return;
            case ts.SyntaxKind.VariableStatement:
                createVariableStatement(node as import("typescript-3.1.6").VariableStatement);
                return;
            case ts.SyntaxKind.EmptyStatement:
                createEmptyStatement(node as import("typescript-3.1.6").EmptyStatement);
                return;
            case ts.SyntaxKind.ExpressionStatement:
                createExpressionStatement(node as import("typescript-3.1.6").ExpressionStatement);
                return;
            case ts.SyntaxKind.IfStatement:
                createIf(node as import("typescript-3.1.6").IfStatement);
                return;
            case ts.SyntaxKind.DoStatement:
                createDo(node as import("typescript-3.1.6").DoStatement);
                return;
            case ts.SyntaxKind.WhileStatement:
                createWhile(node as import("typescript-3.1.6").WhileStatement);
                return;
            case ts.SyntaxKind.ForStatement:
                createFor(node as import("typescript-3.1.6").ForStatement);
                return;
            case ts.SyntaxKind.ForInStatement:
                createForIn(node as import("typescript-3.1.6").ForInStatement);
                return;
            case ts.SyntaxKind.ForOfStatement:
                createForOf(node as import("typescript-3.1.6").ForOfStatement);
                return;
            case ts.SyntaxKind.ContinueStatement:
                createContinue(node as import("typescript-3.1.6").ContinueStatement);
                return;
            case ts.SyntaxKind.BreakStatement:
                createBreak(node as import("typescript-3.1.6").BreakStatement);
                return;
            case ts.SyntaxKind.ReturnStatement:
                createReturn(node as import("typescript-3.1.6").ReturnStatement);
                return;
            case ts.SyntaxKind.WithStatement:
                createWith(node as import("typescript-3.1.6").WithStatement);
                return;
            case ts.SyntaxKind.SwitchStatement:
                createSwitch(node as import("typescript-3.1.6").SwitchStatement);
                return;
            case ts.SyntaxKind.LabeledStatement:
                createLabel(node as import("typescript-3.1.6").LabeledStatement);
                return;
            case ts.SyntaxKind.ThrowStatement:
                createThrow(node as import("typescript-3.1.6").ThrowStatement);
                return;
            case ts.SyntaxKind.TryStatement:
                createTry(node as import("typescript-3.1.6").TryStatement);
                return;
            case ts.SyntaxKind.DebuggerStatement:
                createDebuggerStatement(node as import("typescript-3.1.6").DebuggerStatement);
                return;
            case ts.SyntaxKind.VariableDeclaration:
                createVariableDeclaration(node as import("typescript-3.1.6").VariableDeclaration);
                return;
            case ts.SyntaxKind.VariableDeclarationList:
                createVariableDeclarationList(node as import("typescript-3.1.6").VariableDeclarationList);
                return;
            case ts.SyntaxKind.FunctionDeclaration:
                createFunctionDeclaration(node as import("typescript-3.1.6").FunctionDeclaration);
                return;
            case ts.SyntaxKind.ClassDeclaration:
                createClassDeclaration(node as import("typescript-3.1.6").ClassDeclaration);
                return;
            case ts.SyntaxKind.InterfaceDeclaration:
                createInterfaceDeclaration(node as import("typescript-3.1.6").InterfaceDeclaration);
                return;
            case ts.SyntaxKind.TypeAliasDeclaration:
                createTypeAliasDeclaration(node as import("typescript-3.1.6").TypeAliasDeclaration);
                return;
            case ts.SyntaxKind.EnumDeclaration:
                createEnumDeclaration(node as import("typescript-3.1.6").EnumDeclaration);
                return;
            case ts.SyntaxKind.ModuleDeclaration:
                createModuleDeclaration(node as import("typescript-3.1.6").ModuleDeclaration);
                return;
            case ts.SyntaxKind.ModuleBlock:
                createModuleBlock(node as import("typescript-3.1.6").ModuleBlock);
                return;
            case ts.SyntaxKind.CaseBlock:
                createCaseBlock(node as import("typescript-3.1.6").CaseBlock);
                return;
            case ts.SyntaxKind.NamespaceExportDeclaration:
                createNamespaceExportDeclaration(node as import("typescript-3.1.6").NamespaceExportDeclaration);
                return;
            case ts.SyntaxKind.ImportEqualsDeclaration:
                createImportEqualsDeclaration(node as import("typescript-3.1.6").ImportEqualsDeclaration);
                return;
            case ts.SyntaxKind.ImportDeclaration:
                createImportDeclaration(node as import("typescript-3.1.6").ImportDeclaration);
                return;
            case ts.SyntaxKind.ImportClause:
                createImportClause(node as import("typescript-3.1.6").ImportClause);
                return;
            case ts.SyntaxKind.NamespaceImport:
                createNamespaceImport(node as import("typescript-3.1.6").NamespaceImport);
                return;
            case ts.SyntaxKind.NamedImports:
                createNamedImports(node as import("typescript-3.1.6").NamedImports);
                return;
            case ts.SyntaxKind.ImportSpecifier:
                createImportSpecifier(node as import("typescript-3.1.6").ImportSpecifier);
                return;
            case ts.SyntaxKind.ExportAssignment:
                createExportAssignment(node as import("typescript-3.1.6").ExportAssignment);
                return;
            case ts.SyntaxKind.ExportDeclaration:
                createExportDeclaration(node as import("typescript-3.1.6").ExportDeclaration);
                return;
            case ts.SyntaxKind.NamedExports:
                createNamedExports(node as import("typescript-3.1.6").NamedExports);
                return;
            case ts.SyntaxKind.ExportSpecifier:
                createExportSpecifier(node as import("typescript-3.1.6").ExportSpecifier);
                return;
            case ts.SyntaxKind.ExternalModuleReference:
                createExternalModuleReference(node as import("typescript-3.1.6").ExternalModuleReference);
                return;
            case ts.SyntaxKind.JsxElement:
                createJsxElement(node as import("typescript-3.1.6").JsxElement);
                return;
            case ts.SyntaxKind.JsxSelfClosingElement:
                createJsxSelfClosingElement(node as import("typescript-3.1.6").JsxSelfClosingElement);
                return;
            case ts.SyntaxKind.JsxOpeningElement:
                createJsxOpeningElement(node as import("typescript-3.1.6").JsxOpeningElement);
                return;
            case ts.SyntaxKind.JsxClosingElement:
                createJsxClosingElement(node as import("typescript-3.1.6").JsxClosingElement);
                return;
            case ts.SyntaxKind.JsxFragment:
                createJsxFragment(node as import("typescript-3.1.6").JsxFragment);
                return;
            case ts.SyntaxKind.JsxAttribute:
                createJsxAttribute(node as import("typescript-3.1.6").JsxAttribute);
                return;
            case ts.SyntaxKind.JsxAttributes:
                createJsxAttributes(node as import("typescript-3.1.6").JsxAttributes);
                return;
            case ts.SyntaxKind.JsxSpreadAttribute:
                createJsxSpreadAttribute(node as import("typescript-3.1.6").JsxSpreadAttribute);
                return;
            case ts.SyntaxKind.JsxExpression:
                createJsxExpression(node as import("typescript-3.1.6").JsxExpression);
                return;
            case ts.SyntaxKind.CaseClause:
                createCaseClause(node as import("typescript-3.1.6").CaseClause);
                return;
            case ts.SyntaxKind.DefaultClause:
                createDefaultClause(node as import("typescript-3.1.6").DefaultClause);
                return;
            case ts.SyntaxKind.HeritageClause:
                createHeritageClause(node as import("typescript-3.1.6").HeritageClause);
                return;
            case ts.SyntaxKind.CatchClause:
                createCatchClause(node as import("typescript-3.1.6").CatchClause);
                return;
            case ts.SyntaxKind.PropertyAssignment:
                createPropertyAssignment(node as import("typescript-3.1.6").PropertyAssignment);
                return;
            case ts.SyntaxKind.ShorthandPropertyAssignment:
                createShorthandPropertyAssignment(node as import("typescript-3.1.6").ShorthandPropertyAssignment);
                return;
            case ts.SyntaxKind.SpreadAssignment:
                createSpreadAssignment(node as import("typescript-3.1.6").SpreadAssignment);
                return;
            case ts.SyntaxKind.EnumMember:
                createEnumMember(node as import("typescript-3.1.6").EnumMember);
                return;
            case ts.SyntaxKind.CommaListExpression:
                createCommaList(node as import("typescript-3.1.6").CommaListExpression);
                return;
            default:
                if (node.kind >= ts.SyntaxKind.FirstToken && node.kind <= ts.SyntaxKind.LastToken) {
                    writer.write("ts.createToken(ts.SyntaxKind.").write(syntaxKindToName[node.kind]).write(")");
                    return;
                }
                writer.write("/* Unhandled node kind: ").write(syntaxKindToName[node.kind]).write(" */")
        }
    }

    function createNumericLiteral(node: import("typescript-3.1.6").NumericLiteral) {
        writer.write("ts.createNumericLiteral(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createStringLiteral(node: import("typescript-3.1.6").StringLiteral) {
        writer.write("ts.createStringLiteral(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createRegularExpressionLiteral(node: import("typescript-3.1.6").RegularExpressionLiteral) {
        writer.write("ts.createRegularExpressionLiteral(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createIdentifier(node: import("typescript-3.1.6").Identifier) {
        writer.write("ts.createIdentifier(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createSuper(node: import("typescript-3.1.6").SuperExpression) {
        writer.write("ts.createSuper(");
        writer.write(")");
    }

    function createThis(node: import("typescript-3.1.6").ThisExpression) {
        writer.write("ts.createThis(");
        writer.write(")");
    }

    function createNull(node: import("typescript-3.1.6").NullLiteral) {
        writer.write("ts.createNull(");
        writer.write(")");
    }

    function createTrue(node: import("typescript-3.1.6").BooleanLiteral) {
        writer.write("ts.createTrue(");
        writer.write(")");
    }

    function createFalse(node: import("typescript-3.1.6").BooleanLiteral) {
        writer.write("ts.createFalse(");
        writer.write(")");
    }

    function createQualifiedName(node: import("typescript-3.1.6").QualifiedName) {
        writer.write("ts.createQualifiedName(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.left)
            writer.write(",").newLine();
            writeNodeText(node.right)
        });
        writer.write(")");
    }

    function createComputedPropertyName(node: import("typescript-3.1.6").ComputedPropertyName) {
        writer.write("ts.createComputedPropertyName(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createTypeParameterDeclaration(node: import("typescript-3.1.6").TypeParameterDeclaration) {
        writer.write("ts.createTypeParameterDeclaration(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.constraint == null)
                writer.write("undefined");
            else {
                writeNodeText(node.constraint)
            }
            writer.write(",").newLine();
            if (node.default == null)
                writer.write("undefined");
            else {
                writeNodeText(node.default)
            }
        });
        writer.write(")");
    }

    function createParameter(node: import("typescript-3.1.6").ParameterDeclaration) {
        writer.write("ts.createParameter(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.dotDotDotToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.dotDotDotToken)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.questionToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.questionToken)
            }
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createDecorator(node: import("typescript-3.1.6").Decorator) {
        writer.write("ts.createDecorator(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createPropertySignature(node: import("typescript-3.1.6").PropertySignature) {
        writer.write("ts.createPropertySignature(");
        writer.newLine();
        writer.indent(() => {
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.questionToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.questionToken)
            }
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createProperty(node: import("typescript-3.1.6").PropertyDeclaration) {
        writer.write("ts.createProperty(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.questionToken != null)
                writer.write("ts.createToken(ts.SyntaxKind.QuestionToken)");
            else if (node.exclamationToken != null)
                writer.write("ts.createToken(ts.SyntaxKind.ExclamationToken)");
            else
                writer.write("undefined");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createMethodSignature(node: import("typescript-3.1.6").MethodSignature) {
        writer.write("ts.createMethodSignature(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.questionToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.questionToken)
            }
        });
        writer.write(")");
    }

    function createMethod(node: import("typescript-3.1.6").MethodDeclaration) {
        writer.write("ts.createMethod(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.asteriskToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.asteriskToken)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.questionToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.questionToken)
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
        });
        writer.write(")");
    }

    function createConstructor(node: import("typescript-3.1.6").ConstructorDeclaration) {
        writer.write("ts.createConstructor(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
        });
        writer.write(")");
    }

    function createGetAccessor(node: import("typescript-3.1.6").GetAccessorDeclaration) {
        writer.write("ts.createGetAccessor(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
        });
        writer.write(")");
    }

    function createSetAccessor(node: import("typescript-3.1.6").SetAccessorDeclaration) {
        writer.write("ts.createSetAccessor(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
        });
        writer.write(")");
    }

    function createCallSignature(node: import("typescript-3.1.6").CallSignatureDeclaration) {
        writer.write("ts.createCallSignature(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
        });
        writer.write(")");
    }

    function createConstructSignature(node: import("typescript-3.1.6").ConstructSignatureDeclaration) {
        writer.write("ts.createConstructSignature(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
        });
        writer.write(")");
    }

    function createIndexSignature(node: import("typescript-3.1.6").IndexSignatureDeclaration) {
        writer.write("ts.createIndexSignature(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
        });
        writer.write(")");
    }

    function createKeywordTypeNode(node: import("typescript-3.1.6").KeywordTypeNode) {
        writer.write("ts.createKeywordTypeNode(");
        writer.write("ts.SyntaxKind.").write(syntaxKindToName[node.kind])
        writer.write(")");
    }

    function createTypePredicateNode(node: import("typescript-3.1.6").TypePredicateNode) {
        writer.write("ts.createTypePredicateNode(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.parameterName)
            writer.write(",").newLine();
            writeNodeText(node.type)
        });
        writer.write(")");
    }

    function createTypeReferenceNode(node: import("typescript-3.1.6").TypeReferenceNode) {
        writer.write("ts.createTypeReferenceNode(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.typeName)
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
        });
        writer.write(")");
    }

    function createFunctionTypeNode(node: import("typescript-3.1.6").FunctionTypeNode) {
        writer.write("ts.createFunctionTypeNode(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writeNodeText(node.type)
        });
        writer.write(")");
    }

    function createConstructorTypeNode(node: import("typescript-3.1.6").ConstructorTypeNode) {
        writer.write("ts.createConstructorTypeNode(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writeNodeText(node.type)
        });
        writer.write(")");
    }

    function createTypeQueryNode(node: import("typescript-3.1.6").TypeQueryNode) {
        writer.write("ts.createTypeQueryNode(");
        writeNodeText(node.exprName)
        writer.write(")");
    }

    function createTypeLiteralNode(node: import("typescript-3.1.6").TypeLiteralNode) {
        writer.write("ts.createTypeLiteralNode(");
        writer.write("[");
        if (node.members.length === 1) {
            const item = node.members![0];
            writeNodeText(item)
        }
        else if (node.members.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.members!.length; i++) {
                    const item = node.members![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createArrayTypeNode(node: import("typescript-3.1.6").ArrayTypeNode) {
        writer.write("ts.createArrayTypeNode(");
        writeNodeText(node.elementType)
        writer.write(")");
    }

    function createTupleTypeNode(node: import("typescript-3.1.6").TupleTypeNode) {
        writer.write("ts.createTupleTypeNode(");
        writer.write("[");
        if (node.elementTypes.length === 1) {
            const item = node.elementTypes![0];
            writeNodeText(item)
        }
        else if (node.elementTypes.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elementTypes!.length; i++) {
                    const item = node.elementTypes![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createOptionalTypeNode(node: import("typescript-3.1.6").OptionalTypeNode) {
        writer.write("ts.createOptionalTypeNode(");
        writeNodeText(node.type)
        writer.write(")");
    }

    function createRestTypeNode(node: import("typescript-3.1.6").RestTypeNode) {
        writer.write("ts.createRestTypeNode(");
        writeNodeText(node.type)
        writer.write(")");
    }

    function createUnionTypeNode(node: import("typescript-3.1.6").UnionTypeNode) {
        writer.write("ts.createUnionTypeNode(");
        writer.write("[");
        if (node.types.length === 1) {
            const item = node.types![0];
            writeNodeText(item)
        }
        else if (node.types.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.types!.length; i++) {
                    const item = node.types![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createIntersectionTypeNode(node: import("typescript-3.1.6").IntersectionTypeNode) {
        writer.write("ts.createIntersectionTypeNode(");
        writer.write("[");
        if (node.types.length === 1) {
            const item = node.types![0];
            writeNodeText(item)
        }
        else if (node.types.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.types!.length; i++) {
                    const item = node.types![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createConditionalTypeNode(node: import("typescript-3.1.6").ConditionalTypeNode) {
        writer.write("ts.createConditionalTypeNode(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.checkType)
            writer.write(",").newLine();
            writeNodeText(node.extendsType)
            writer.write(",").newLine();
            writeNodeText(node.trueType)
            writer.write(",").newLine();
            writeNodeText(node.falseType)
        });
        writer.write(")");
    }

    function createInferTypeNode(node: import("typescript-3.1.6").InferTypeNode) {
        writer.write("ts.createInferTypeNode(");
        writeNodeText(node.typeParameter)
        writer.write(")");
    }

    function createImportTypeNode(node: import("typescript-3.1.6").ImportTypeNode) {
        writer.write("ts.createImportTypeNode(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.argument)
            writer.write(",").newLine();
            if (node.qualifier == null)
                writer.write("undefined");
            else {
                writeNodeText(node.qualifier)
            }
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.isTypeOf == null)
                writer.write("undefined");
            else {
                writer.write(node.isTypeOf.toString())
            }
        });
        writer.write(")");
    }

    function createParenthesizedType(node: import("typescript-3.1.6").ParenthesizedTypeNode) {
        writer.write("ts.createParenthesizedType(");
        writeNodeText(node.type)
        writer.write(")");
    }

    function createThisTypeNode(node: import("typescript-3.1.6").ThisTypeNode) {
        writer.write("ts.createThisTypeNode(");
        writer.write(")");
    }

    function createTypeOperatorNode(node: import("typescript-3.1.6").TypeOperatorNode) {
        writer.write("ts.createTypeOperatorNode(");
        writeNodeText(node.type)
        writer.write(")");
    }

    function createIndexedAccessTypeNode(node: import("typescript-3.1.6").IndexedAccessTypeNode) {
        writer.write("ts.createIndexedAccessTypeNode(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.objectType)
            writer.write(",").newLine();
            writeNodeText(node.indexType)
        });
        writer.write(")");
    }

    function createMappedTypeNode(node: import("typescript-3.1.6").MappedTypeNode) {
        writer.write("ts.createMappedTypeNode(");
        writer.newLine();
        writer.indent(() => {
            if (node.readonlyToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.readonlyToken)
            }
            writer.write(",").newLine();
            writeNodeText(node.typeParameter)
            writer.write(",").newLine();
            if (node.questionToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.questionToken)
            }
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
        });
        writer.write(")");
    }

    function createLiteralTypeNode(node: import("typescript-3.1.6").LiteralTypeNode) {
        writer.write("ts.createLiteralTypeNode(");
        writeNodeText(node.literal)
        writer.write(")");
    }

    function createObjectBindingPattern(node: import("typescript-3.1.6").ObjectBindingPattern) {
        writer.write("ts.createObjectBindingPattern(");
        writer.write("[");
        if (node.elements.length === 1) {
            const item = node.elements![0];
            writeNodeText(item)
        }
        else if (node.elements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elements!.length; i++) {
                    const item = node.elements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createArrayBindingPattern(node: import("typescript-3.1.6").ArrayBindingPattern) {
        writer.write("ts.createArrayBindingPattern(");
        writer.write("[");
        if (node.elements.length === 1) {
            const item = node.elements![0];
            writeNodeText(item)
        }
        else if (node.elements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elements!.length; i++) {
                    const item = node.elements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createBindingElement(node: import("typescript-3.1.6").BindingElement) {
        writer.write("ts.createBindingElement(");
        writer.newLine();
        writer.indent(() => {
            if (node.dotDotDotToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.dotDotDotToken)
            }
            writer.write(",").newLine();
            if (node.propertyName == null)
                writer.write("undefined");
            else {
                writeNodeText(node.propertyName)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createArrayLiteral(node: import("typescript-3.1.6").ArrayLiteralExpression) {
        writer.write("ts.createArrayLiteral(");
        writer.newLine();
        writer.indent(() => {
            writer.write("[");
            if (node.elements.length === 1) {
                const item = node.elements![0];
                writeNodeText(item)
            }
            else if (node.elements.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.elements!.length; i++) {
                        const item = node.elements![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writer.write(((node as any).multiLine || false).toString())
        });
        writer.write(")");
    }

    function createObjectLiteral(node: import("typescript-3.1.6").ObjectLiteralExpression) {
        writer.write("ts.createObjectLiteral(");
        writer.newLine();
        writer.indent(() => {
            writer.write("[");
            if (node.properties.length === 1) {
                const item = node.properties![0];
                writeNodeText(item)
            }
            else if (node.properties.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.properties!.length; i++) {
                        const item = node.properties![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writer.write(((node as any).multiLine || false).toString())
        });
        writer.write(")");
    }

    function createPropertyAccess(node: import("typescript-3.1.6").PropertyAccessExpression) {
        writer.write("ts.createPropertyAccess(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.name)
        });
        writer.write(")");
    }

    function createElementAccess(node: import("typescript-3.1.6").ElementAccessExpression) {
        writer.write("ts.createElementAccess(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.argumentExpression)
        });
        writer.write(")");
    }

    function createCall(node: import("typescript-3.1.6").CallExpression) {
        writer.write("ts.createCall(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.arguments.length === 1) {
                const item = node.arguments![0];
                writeNodeText(item)
            }
            else if (node.arguments.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.arguments!.length; i++) {
                        const item = node.arguments![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createNew(node: import("typescript-3.1.6").NewExpression) {
        writer.write("ts.createNew(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.arguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.arguments.length === 1) {
                    const item = node.arguments![0];
                    writeNodeText(item)
                }
                else if (node.arguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.arguments!.length; i++) {
                            const item = node.arguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
        });
        writer.write(")");
    }

    function createTaggedTemplate(node: import("typescript-3.1.6").TaggedTemplateExpression) {
        writer.write("ts.createTaggedTemplate(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.tag)
            writer.write(",").newLine();
            writeNodeText(node.template)
        });
        writer.write(")");
    }

    function createTypeAssertion(node: import("typescript-3.1.6").TypeAssertion) {
        writer.write("ts.createTypeAssertion(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.type)
            writer.write(",").newLine();
            writeNodeText(node.expression)
        });
        writer.write(")");
    }

    function createParen(node: import("typescript-3.1.6").ParenthesizedExpression) {
        writer.write("ts.createParen(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createFunctionExpression(node: import("typescript-3.1.6").FunctionExpression) {
        writer.write("ts.createFunctionExpression(");
        writer.newLine();
        writer.indent(() => {
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.asteriskToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.asteriskToken)
            }
            writer.write(",").newLine();
            if (node.name == null)
                writer.write("undefined");
            else {
                writeNodeText(node.name)
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            writeNodeText(node.body)
        });
        writer.write(")");
    }

    function createArrowFunction(node: import("typescript-3.1.6").ArrowFunction) {
        writer.write("ts.createArrowFunction(");
        writer.newLine();
        writer.indent(() => {
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            writeNodeText(node.equalsGreaterThanToken)
            writer.write(",").newLine();
            writeNodeText(node.body)
        });
        writer.write(")");
    }

    function createDelete(node: import("typescript-3.1.6").DeleteExpression) {
        writer.write("ts.createDelete(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createTypeOf(node: import("typescript-3.1.6").TypeOfExpression) {
        writer.write("ts.createTypeOf(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createVoid(node: import("typescript-3.1.6").VoidExpression) {
        writer.write("ts.createVoid(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createAwait(node: import("typescript-3.1.6").AwaitExpression) {
        writer.write("ts.createAwait(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createPrefix(node: import("typescript-3.1.6").PrefixUnaryExpression) {
        writer.write("ts.createPrefix(");
        writer.newLine();
        writer.indent(() => {
            writer.write("ts.SyntaxKind.").write(syntaxKindToName[node.operator])
            writer.write(",").newLine();
            writeNodeText(node.operand)
        });
        writer.write(")");
    }

    function createPostfix(node: import("typescript-3.1.6").PostfixUnaryExpression) {
        writer.write("ts.createPostfix(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.operand)
            writer.write(",").newLine();
            writer.write("ts.SyntaxKind.").write(syntaxKindToName[node.operator])
        });
        writer.write(")");
    }

    function createBinary(node: import("typescript-3.1.6").BinaryExpression) {
        writer.write("ts.createBinary(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.left)
            writer.write(",").newLine();
            writeNodeText(node.operatorToken)
            writer.write(",").newLine();
            writeNodeText(node.right)
        });
        writer.write(")");
    }

    function createConditional(node: import("typescript-3.1.6").ConditionalExpression) {
        writer.write("ts.createConditional(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.condition)
            writer.write(",").newLine();
            writeNodeText(node.whenTrue)
            writer.write(",").newLine();
            writeNodeText(node.whenFalse)
        });
        writer.write(")");
    }

    function createTemplateExpression(node: import("typescript-3.1.6").TemplateExpression) {
        writer.write("ts.createTemplateExpression(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.head)
            writer.write(",").newLine();
            writer.write("[");
            if (node.templateSpans.length === 1) {
                const item = node.templateSpans![0];
                writeNodeText(item)
            }
            else if (node.templateSpans.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.templateSpans!.length; i++) {
                        const item = node.templateSpans![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createTemplateHead(node: import("typescript-3.1.6").TemplateHead) {
        writer.write("ts.createTemplateHead(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createTemplateMiddle(node: import("typescript-3.1.6").TemplateMiddle) {
        writer.write("ts.createTemplateMiddle(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createTemplateTail(node: import("typescript-3.1.6").TemplateTail) {
        writer.write("ts.createTemplateTail(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createNoSubstitutionTemplateLiteral(node: import("typescript-3.1.6").NoSubstitutionTemplateLiteral) {
        writer.write("ts.createNoSubstitutionTemplateLiteral(");
        writer.quote(node.text.toString())
        writer.write(")");
    }

    function createYield(node: import("typescript-3.1.6").YieldExpression) {
        writer.write("ts.createYield(");
        if (node.expression == null)
            writer.write("undefined");
        else {
            writeNodeText(node.expression)
        }
        writer.write(")");
    }

    function createSpread(node: import("typescript-3.1.6").SpreadElement) {
        writer.write("ts.createSpread(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createClassExpression(node: import("typescript-3.1.6").ClassExpression) {
        writer.write("ts.createClassExpression(");
        writer.newLine();
        writer.indent(() => {
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.name == null)
                writer.write("undefined");
            else {
                writeNodeText(node.name)
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.heritageClauses == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.heritageClauses.length === 1) {
                    const item = node.heritageClauses![0];
                    writeNodeText(item)
                }
                else if (node.heritageClauses.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.heritageClauses!.length; i++) {
                            const item = node.heritageClauses![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.members.length === 1) {
                const item = node.members![0];
                writeNodeText(item)
            }
            else if (node.members.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.members!.length; i++) {
                        const item = node.members![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createOmittedExpression(node: import("typescript-3.1.6").OmittedExpression) {
        writer.write("ts.createOmittedExpression(");
        writer.write(")");
    }

    function createExpressionWithTypeArguments(node: import("typescript-3.1.6").ExpressionWithTypeArguments) {
        writer.write("ts.createExpressionWithTypeArguments(");
        writer.newLine();
        writer.indent(() => {
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.expression)
        });
        writer.write(")");
    }

    function createAsExpression(node: import("typescript-3.1.6").AsExpression) {
        writer.write("ts.createAsExpression(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.type)
        });
        writer.write(")");
    }

    function createNonNullExpression(node: import("typescript-3.1.6").NonNullExpression) {
        writer.write("ts.createNonNullExpression(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createMetaProperty(node: import("typescript-3.1.6").MetaProperty) {
        writer.write("ts.createMetaProperty(");
        writer.newLine();
        writer.indent(() => {
            writer.write("ts.SyntaxKind.").write(syntaxKindToName[node.keywordToken])
            writer.write(",").newLine();
            writeNodeText(node.name)
        });
        writer.write(")");
    }

    function createTemplateSpan(node: import("typescript-3.1.6").TemplateSpan) {
        writer.write("ts.createTemplateSpan(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.literal)
        });
        writer.write(")");
    }

    function createSemicolonClassElement(node: import("typescript-3.1.6").SemicolonClassElement) {
        writer.write("ts.createSemicolonClassElement(");
        writer.write(")");
    }

    function createBlock(node: import("typescript-3.1.6").Block) {
        writer.write("ts.createBlock(");
        writer.newLine();
        writer.indent(() => {
            writer.write("[");
            if (node.statements.length === 1) {
                const item = node.statements![0];
                writeNodeText(item)
            }
            else if (node.statements.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.statements!.length; i++) {
                        const item = node.statements![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writer.write(((node as any).multiLine || false).toString())
        });
        writer.write(")");
    }

    function createVariableStatement(node: import("typescript-3.1.6").VariableStatement) {
        writer.write("ts.createVariableStatement(");
        writer.newLine();
        writer.indent(() => {
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.declarationList)
        });
        writer.write(")");
    }

    function createEmptyStatement(node: import("typescript-3.1.6").EmptyStatement) {
        writer.write("ts.createEmptyStatement(");
        writer.write(")");
    }

    function createExpressionStatement(node: import("typescript-3.1.6").ExpressionStatement) {
        writer.write("ts.createExpressionStatement(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createIf(node: import("typescript-3.1.6").IfStatement) {
        writer.write("ts.createIf(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.thenStatement)
            writer.write(",").newLine();
            if (node.elseStatement == null)
                writer.write("undefined");
            else {
                writeNodeText(node.elseStatement)
            }
        });
        writer.write(")");
    }

    function createDo(node: import("typescript-3.1.6").DoStatement) {
        writer.write("ts.createDo(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.statement)
            writer.write(",").newLine();
            writeNodeText(node.expression)
        });
        writer.write(")");
    }

    function createWhile(node: import("typescript-3.1.6").WhileStatement) {
        writer.write("ts.createWhile(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createFor(node: import("typescript-3.1.6").ForStatement) {
        writer.write("ts.createFor(");
        writer.newLine();
        writer.indent(() => {
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
            writer.write(",").newLine();
            if (node.condition == null)
                writer.write("undefined");
            else {
                writeNodeText(node.condition)
            }
            writer.write(",").newLine();
            if (node.incrementor == null)
                writer.write("undefined");
            else {
                writeNodeText(node.incrementor)
            }
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createForIn(node: import("typescript-3.1.6").ForInStatement) {
        writer.write("ts.createForIn(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.initializer)
            writer.write(",").newLine();
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createForOf(node: import("typescript-3.1.6").ForOfStatement) {
        writer.write("ts.createForOf(");
        writer.newLine();
        writer.indent(() => {
            if (node.awaitModifier == null)
                writer.write("undefined");
            else {
                writeNodeText(node.awaitModifier)
            }
            writer.write(",").newLine();
            writeNodeText(node.initializer)
            writer.write(",").newLine();
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createContinue(node: import("typescript-3.1.6").ContinueStatement) {
        writer.write("ts.createContinue(");
        if (node.label == null)
            writer.write("undefined");
        else {
            writeNodeText(node.label)
        }
        writer.write(")");
    }

    function createBreak(node: import("typescript-3.1.6").BreakStatement) {
        writer.write("ts.createBreak(");
        if (node.label == null)
            writer.write("undefined");
        else {
            writeNodeText(node.label)
        }
        writer.write(")");
    }

    function createReturn(node: import("typescript-3.1.6").ReturnStatement) {
        writer.write("ts.createReturn(");
        if (node.expression == null)
            writer.write("undefined");
        else {
            writeNodeText(node.expression)
        }
        writer.write(")");
    }

    function createWith(node: import("typescript-3.1.6").WithStatement) {
        writer.write("ts.createWith(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createSwitch(node: import("typescript-3.1.6").SwitchStatement) {
        writer.write("ts.createSwitch(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writeNodeText(node.caseBlock)
        });
        writer.write(")");
    }

    function createLabel(node: import("typescript-3.1.6").LabeledStatement) {
        writer.write("ts.createLabel(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.label)
            writer.write(",").newLine();
            writeNodeText(node.statement)
        });
        writer.write(")");
    }

    function createThrow(node: import("typescript-3.1.6").ThrowStatement) {
        writer.write("ts.createThrow(");
        if (node.expression == null)
            writer.write("undefined");
        else {
            writeNodeText(node.expression)
        }
        writer.write(")");
    }

    function createTry(node: import("typescript-3.1.6").TryStatement) {
        writer.write("ts.createTry(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.tryBlock)
            writer.write(",").newLine();
            if (node.catchClause == null)
                writer.write("undefined");
            else {
                writeNodeText(node.catchClause)
            }
            writer.write(",").newLine();
            if (node.finallyBlock == null)
                writer.write("undefined");
            else {
                writeNodeText(node.finallyBlock)
            }
        });
        writer.write(")");
    }

    function createDebuggerStatement(node: import("typescript-3.1.6").DebuggerStatement) {
        writer.write("ts.createDebuggerStatement(");
        writer.write(")");
    }

    function createVariableDeclaration(node: import("typescript-3.1.6").VariableDeclaration) {
        writer.write("ts.createVariableDeclaration(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createVariableDeclarationList(node: import("typescript-3.1.6").VariableDeclarationList) {
        writer.write("ts.createVariableDeclarationList(");
        writer.newLine();
        writer.indent(() => {
            writer.write("[");
            if (node.declarations.length === 1) {
                const item = node.declarations![0];
                writeNodeText(item)
            }
            else if (node.declarations.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.declarations!.length; i++) {
                        const item = node.declarations![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writer.write(getNodeFlagValues(node.flags || 0));
        });
        writer.write(")");
    }

    function createFunctionDeclaration(node: import("typescript-3.1.6").FunctionDeclaration) {
        writer.write("ts.createFunctionDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.asteriskToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.asteriskToken)
            }
            writer.write(",").newLine();
            if (node.name == null)
                writer.write("undefined");
            else {
                writeNodeText(node.name)
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.parameters.length === 1) {
                const item = node.parameters![0];
                writeNodeText(item)
            }
            else if (node.parameters.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.parameters!.length; i++) {
                        const item = node.parameters![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            if (node.type == null)
                writer.write("undefined");
            else {
                writeNodeText(node.type)
            }
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
        });
        writer.write(")");
    }

    function createClassDeclaration(node: import("typescript-3.1.6").ClassDeclaration) {
        writer.write("ts.createClassDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.name == null)
                writer.write("undefined");
            else {
                writeNodeText(node.name)
            }
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.heritageClauses == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.heritageClauses.length === 1) {
                    const item = node.heritageClauses![0];
                    writeNodeText(item)
                }
                else if (node.heritageClauses.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.heritageClauses!.length; i++) {
                            const item = node.heritageClauses![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.members.length === 1) {
                const item = node.members![0];
                writeNodeText(item)
            }
            else if (node.members.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.members!.length; i++) {
                        const item = node.members![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createInterfaceDeclaration(node: import("typescript-3.1.6").InterfaceDeclaration) {
        writer.write("ts.createInterfaceDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.heritageClauses == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.heritageClauses.length === 1) {
                    const item = node.heritageClauses![0];
                    writeNodeText(item)
                }
                else if (node.heritageClauses.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.heritageClauses!.length; i++) {
                            const item = node.heritageClauses![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writer.write("[");
            if (node.members.length === 1) {
                const item = node.members![0];
                writeNodeText(item)
            }
            else if (node.members.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.members!.length; i++) {
                        const item = node.members![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createTypeAliasDeclaration(node: import("typescript-3.1.6").TypeAliasDeclaration) {
        writer.write("ts.createTypeAliasDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.typeParameters == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeParameters.length === 1) {
                    const item = node.typeParameters![0];
                    writeNodeText(item)
                }
                else if (node.typeParameters.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeParameters!.length; i++) {
                            const item = node.typeParameters![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.type)
        });
        writer.write(")");
    }

    function createEnumDeclaration(node: import("typescript-3.1.6").EnumDeclaration) {
        writer.write("ts.createEnumDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            writer.write("[");
            if (node.members.length === 1) {
                const item = node.members![0];
                writeNodeText(item)
            }
            else if (node.members.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.members!.length; i++) {
                        const item = node.members![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createModuleDeclaration(node: import("typescript-3.1.6").ModuleDeclaration) {
        writer.write("ts.createModuleDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.body == null)
                writer.write("undefined");
            else {
                writeNodeText(node.body)
            }
            writer.write(",").newLine();
            writer.write(getNodeFlagValues(node.flags || 0));
        });
        writer.write(")");
    }

    function createModuleBlock(node: import("typescript-3.1.6").ModuleBlock) {
        writer.write("ts.createModuleBlock(");
        writer.write("[");
        if (node.statements.length === 1) {
            const item = node.statements![0];
            writeNodeText(item)
        }
        else if (node.statements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.statements!.length; i++) {
                    const item = node.statements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createCaseBlock(node: import("typescript-3.1.6").CaseBlock) {
        writer.write("ts.createCaseBlock(");
        writer.write("[");
        if (node.clauses.length === 1) {
            const item = node.clauses![0];
            writeNodeText(item)
        }
        else if (node.clauses.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.clauses!.length; i++) {
                    const item = node.clauses![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createNamespaceExportDeclaration(node: import("typescript-3.1.6").NamespaceExportDeclaration) {
        writer.write("ts.createNamespaceExportDeclaration(");
        writeNodeText(node.name)
        writer.write(")");
    }

    function createImportEqualsDeclaration(node: import("typescript-3.1.6").ImportEqualsDeclaration) {
        writer.write("ts.createImportEqualsDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
            writer.write(",").newLine();
            writeNodeText(node.moduleReference)
        });
        writer.write(")");
    }

    function createImportDeclaration(node: import("typescript-3.1.6").ImportDeclaration) {
        writer.write("ts.createImportDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.importClause == null)
                writer.write("undefined");
            else {
                writeNodeText(node.importClause)
            }
            writer.write(",").newLine();
            writeNodeText(node.moduleSpecifier)
        });
        writer.write(")");
    }

    function createImportClause(node: import("typescript-3.1.6").ImportClause) {
        writer.write("ts.createImportClause(");
        writer.newLine();
        writer.indent(() => {
            if (node.name == null)
                writer.write("undefined");
            else {
                writeNodeText(node.name)
            }
            writer.write(",").newLine();
            if (node.namedBindings == null)
                writer.write("undefined");
            else {
                writeNodeText(node.namedBindings)
            }
        });
        writer.write(")");
    }

    function createNamespaceImport(node: import("typescript-3.1.6").NamespaceImport) {
        writer.write("ts.createNamespaceImport(");
        writeNodeText(node.name)
        writer.write(")");
    }

    function createNamedImports(node: import("typescript-3.1.6").NamedImports) {
        writer.write("ts.createNamedImports(");
        writer.write("[");
        if (node.elements.length === 1) {
            const item = node.elements![0];
            writeNodeText(item)
        }
        else if (node.elements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elements!.length; i++) {
                    const item = node.elements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createImportSpecifier(node: import("typescript-3.1.6").ImportSpecifier) {
        writer.write("ts.createImportSpecifier(");
        writer.newLine();
        writer.indent(() => {
            if (node.propertyName == null)
                writer.write("undefined");
            else {
                writeNodeText(node.propertyName)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
        });
        writer.write(")");
    }

    function createExportAssignment(node: import("typescript-3.1.6").ExportAssignment) {
        writer.write("ts.createExportAssignment(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.isExportEquals == null)
                writer.write("undefined");
            else {
                writer.write(node.isExportEquals.toString())
            }
            writer.write(",").newLine();
            writeNodeText(node.expression)
        });
        writer.write(")");
    }

    function createExportDeclaration(node: import("typescript-3.1.6").ExportDeclaration) {
        writer.write("ts.createExportDeclaration(");
        writer.newLine();
        writer.indent(() => {
            if (node.decorators == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.decorators.length === 1) {
                    const item = node.decorators![0];
                    writeNodeText(item)
                }
                else if (node.decorators.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.decorators!.length; i++) {
                            const item = node.decorators![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.modifiers == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.modifiers.length === 1) {
                    const item = node.modifiers![0];
                    writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                }
                else if (node.modifiers.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.modifiers!.length; i++) {
                            const item = node.modifiers![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writer.write("ts.createModifier(ts.SyntaxKind." + syntaxKindToName[item.kind] + ")");
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            if (node.exportClause == null)
                writer.write("undefined");
            else {
                writeNodeText(node.exportClause)
            }
            writer.write(",").newLine();
            if (node.moduleSpecifier == null)
                writer.write("undefined");
            else {
                writeNodeText(node.moduleSpecifier)
            }
        });
        writer.write(")");
    }

    function createNamedExports(node: import("typescript-3.1.6").NamedExports) {
        writer.write("ts.createNamedExports(");
        writer.write("[");
        if (node.elements.length === 1) {
            const item = node.elements![0];
            writeNodeText(item)
        }
        else if (node.elements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elements!.length; i++) {
                    const item = node.elements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createExportSpecifier(node: import("typescript-3.1.6").ExportSpecifier) {
        writer.write("ts.createExportSpecifier(");
        writer.newLine();
        writer.indent(() => {
            if (node.propertyName == null)
                writer.write("undefined");
            else {
                writeNodeText(node.propertyName)
            }
            writer.write(",").newLine();
            writeNodeText(node.name)
        });
        writer.write(")");
    }

    function createExternalModuleReference(node: import("typescript-3.1.6").ExternalModuleReference) {
        writer.write("ts.createExternalModuleReference(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createJsxElement(node: import("typescript-3.1.6").JsxElement) {
        writer.write("ts.createJsxElement(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.openingElement)
            writer.write(",").newLine();
            writer.write("[");
            if (node.children.length === 1) {
                const item = node.children![0];
                writeNodeText(item)
            }
            else if (node.children.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.children!.length; i++) {
                        const item = node.children![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writeNodeText(node.closingElement)
        });
        writer.write(")");
    }

    function createJsxSelfClosingElement(node: import("typescript-3.1.6").JsxSelfClosingElement) {
        writer.write("ts.createJsxSelfClosingElement(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.tagName)
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.attributes)
        });
        writer.write(")");
    }

    function createJsxOpeningElement(node: import("typescript-3.1.6").JsxOpeningElement) {
        writer.write("ts.createJsxOpeningElement(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.tagName)
            writer.write(",").newLine();
            if (node.typeArguments == null)
                writer.write("undefined");
            else {
                writer.write("[");
                if (node.typeArguments.length === 1) {
                    const item = node.typeArguments![0];
                    writeNodeText(item)
                }
                else if (node.typeArguments.length > 1) {
                    writer.indent(() => {
                        for (let i = 0; i < node.typeArguments!.length; i++) {
                            const item = node.typeArguments![i];
                            if (i > 0)
                                writer.write(",").newLine();
                            writeNodeText(item)
                        }
                    });
                }
                writer.write("]");
            }
            writer.write(",").newLine();
            writeNodeText(node.attributes)
        });
        writer.write(")");
    }

    function createJsxClosingElement(node: import("typescript-3.1.6").JsxClosingElement) {
        writer.write("ts.createJsxClosingElement(");
        writeNodeText(node.tagName)
        writer.write(")");
    }

    function createJsxFragment(node: import("typescript-3.1.6").JsxFragment) {
        writer.write("ts.createJsxFragment(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.openingFragment)
            writer.write(",").newLine();
            writer.write("[");
            if (node.children.length === 1) {
                const item = node.children![0];
                writeNodeText(item)
            }
            else if (node.children.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.children!.length; i++) {
                        const item = node.children![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
            writer.write(",").newLine();
            writeNodeText(node.closingFragment)
        });
        writer.write(")");
    }

    function createJsxAttribute(node: import("typescript-3.1.6").JsxAttribute) {
        writer.write("ts.createJsxAttribute(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createJsxAttributes(node: import("typescript-3.1.6").JsxAttributes) {
        writer.write("ts.createJsxAttributes(");
        writer.write("[");
        if (node.properties.length === 1) {
            const item = node.properties![0];
            writeNodeText(item)
        }
        else if (node.properties.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.properties!.length; i++) {
                    const item = node.properties![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createJsxSpreadAttribute(node: import("typescript-3.1.6").JsxSpreadAttribute) {
        writer.write("ts.createJsxSpreadAttribute(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createJsxExpression(node: import("typescript-3.1.6").JsxExpression) {
        writer.write("ts.createJsxExpression(");
        writer.newLine();
        writer.indent(() => {
            if (node.dotDotDotToken == null)
                writer.write("undefined");
            else {
                writeNodeText(node.dotDotDotToken)
            }
            writer.write(",").newLine();
            if (node.expression == null)
                writer.write("undefined");
            else {
                writeNodeText(node.expression)
            }
        });
        writer.write(")");
    }

    function createCaseClause(node: import("typescript-3.1.6").CaseClause) {
        writer.write("ts.createCaseClause(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.expression)
            writer.write(",").newLine();
            writer.write("[");
            if (node.statements.length === 1) {
                const item = node.statements![0];
                writeNodeText(item)
            }
            else if (node.statements.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.statements!.length; i++) {
                        const item = node.statements![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createDefaultClause(node: import("typescript-3.1.6").DefaultClause) {
        writer.write("ts.createDefaultClause(");
        writer.write("[");
        if (node.statements.length === 1) {
            const item = node.statements![0];
            writeNodeText(item)
        }
        else if (node.statements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.statements!.length; i++) {
                    const item = node.statements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createHeritageClause(node: import("typescript-3.1.6").HeritageClause) {
        writer.write("ts.createHeritageClause(");
        writer.newLine();
        writer.indent(() => {
            writer.write("ts.SyntaxKind.").write(syntaxKindToName[node.token])
            writer.write(",").newLine();
            writer.write("[");
            if (node.types.length === 1) {
                const item = node.types![0];
                writeNodeText(item)
            }
            else if (node.types.length > 1) {
                writer.indent(() => {
                    for (let i = 0; i < node.types!.length; i++) {
                        const item = node.types![i];
                        if (i > 0)
                            writer.write(",").newLine();
                        writeNodeText(item)
                    }
                });
            }
            writer.write("]");
        });
        writer.write(")");
    }

    function createCatchClause(node: import("typescript-3.1.6").CatchClause) {
        writer.write("ts.createCatchClause(");
        writer.newLine();
        writer.indent(() => {
            if (node.variableDeclaration == null)
                writer.write("undefined");
            else {
                writeNodeText(node.variableDeclaration)
            }
            writer.write(",").newLine();
            writeNodeText(node.block)
        });
        writer.write(")");
    }

    function createPropertyAssignment(node: import("typescript-3.1.6").PropertyAssignment) {
        writer.write("ts.createPropertyAssignment(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            writeNodeText(node.initializer)
        });
        writer.write(")");
    }

    function createShorthandPropertyAssignment(node: import("typescript-3.1.6").ShorthandPropertyAssignment) {
        writer.write("ts.createShorthandPropertyAssignment(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.objectAssignmentInitializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.objectAssignmentInitializer)
            }
        });
        writer.write(")");
    }

    function createSpreadAssignment(node: import("typescript-3.1.6").SpreadAssignment) {
        writer.write("ts.createSpreadAssignment(");
        writeNodeText(node.expression)
        writer.write(")");
    }

    function createEnumMember(node: import("typescript-3.1.6").EnumMember) {
        writer.write("ts.createEnumMember(");
        writer.newLine();
        writer.indent(() => {
            writeNodeText(node.name)
            writer.write(",").newLine();
            if (node.initializer == null)
                writer.write("undefined");
            else {
                writeNodeText(node.initializer)
            }
        });
        writer.write(")");
    }

    function createCommaList(node: import("typescript-3.1.6").CommaListExpression) {
        writer.write("ts.createCommaList(");
        writer.write("[");
        if (node.elements.length === 1) {
            const item = node.elements![0];
            writeNodeText(item)
        }
        else if (node.elements.length > 1) {
            writer.indent(() => {
                for (let i = 0; i < node.elements!.length; i++) {
                    const item = node.elements![i];
                    if (i > 0)
                        writer.write(",").newLine();
                    writeNodeText(item)
                }
            });
        }
        writer.write("]");
        writer.write(")");
    }

    function createSyntaxKindToNameMap() {
        const map: { [kind: number]: string } = {};
        for (const name of Object.keys(ts.SyntaxKind).filter(k => isNaN(parseInt(k, 10)))) {
            const value = (ts.SyntaxKind as any)[name] as number;
            if (map[value] == null)
                map[value] = name;
        }
        return map;
    }

    function getNodeFlagValues(value: number) {
        // ignore the BlockScoped node flag
        return getFlagValuesAsString(ts.NodeFlags, "ts.NodeFlags", value || 0, "None", getFlagValues(ts.NodeFlags, value).filter(v => v !== ts.NodeFlags.BlockScoped));
    }

    function getFlagValuesAsString(enumObj: any, enumName: string, value: number, defaultName: string, flagValues?: number[]) {
        flagValues = flagValues || getFlagValues(enumObj, value);
        const members: string[] = [];
        for (const flagValue of flagValues)
            members.push(enumName + "." + enumObj[flagValue]);
        if (members.length === 0)
            members.push(enumName + "." + defaultName);
        return members.join(" | ");
    }

    function getFlagValues(enumObj: any, value: number) {
        const members: number[] = [];
        for (const prop in enumObj) {
            if (typeof enumObj[prop] === "string")
                continue;
            if ((enumObj[prop] & value) !== 0)
                members.push(enumObj[prop]);
        }
        return members;
    }
}
