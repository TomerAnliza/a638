# חמשת השלבים של פרומפט לויזואליזציה

מתוך השקף «Examples - Prompts for visualization», שיעור 5 בנובמבר 2026 (A_638, סטטיסטיקה וויזואליזציה).
פרומפט טוב לגרף אינו משפט אחד אלא חמישה משפטים, וכל אחד מהם סוגר החלטה אחרת. אם משפט חסר, המודל מחליט במקומך.

## השלבים

| # | השלב | מה הוא קובע | המשפט מהדוגמה |
|---|---|---|---|
| 1 | **בחירת הניתוח והשאילתה** (analysis choice and correct query) | מי אני, מה הנתונים, איזה סוג גרף | "I am a manager of a small business, I want you to take the Excel containing information about my customer's purchases in the past year, and create a bar graph." |
| 2 | **הצירים** (axes) | מה על ציר x, מה על ציר y, ומה לא לדלג עליו | "The x-axis should be the day of week, and the y-axis should be the amount of customers who made a purchase. Make sure to not skip values in the x-axis even if there were not any purchases." |
| 3 | **צבעים והדגשה** (colors and highlight) | איך מחלקים את הסדרה ואיזה צבע מקבל כל חלק | "I want you to divide the bars between customers who made a purchase above 100 shekels and those who did not. Color the first green and the latter red." |
| 4 | **כותרות ותוויות** (titles and labels) | הכותרת המדויקת של הגרף | "Give the graph the title \"Number of customers by day of the week divided by amount spent\"." |
| 5 | **מסר ובהירות** (message and clarity) | מה הקורא צריך להבין במבט אחד | "I want it to be easy to understand the difference between the amounts on different days." |

## הפרומפט המלא מהשקף

> "I am a manager of a small business, I want you to take the Excel containing information about my customer's purchases in the past year, and create a bar graph.
> The x-axis should be the day of week, and the y-axis should be the amount of customers who made a purchase. Make sure to not skip values in the x-axis even if there were not any purchases.
> I want you to divide the bars between customers who made a purchase above 100 shekels and those who did not. Color the first green and the latter red.
> Give the graph the title "Number of customers by day of the week divided by amount spent".
> I want it to be easy to understand the difference between the amounts on different days."

## למה כל שלב חשוב

1. **ניתוח ושאילתה.** התפקיד («מנהל עסק קטן») מכוון את רמת ההסבר, מקור הנתונים מונע ניחוש, וסוג הגרף נבחר לפי השאלה: השוואת גדלים → עמודות; מגמה בזמן → קו; חלק מתוך שלם → דונאט; גריד של ערכים → מפת חום.
2. **צירים.** ההוראה «לא לדלג על ערכים בציר x גם אם לא היו רכישות» היא הדוגמה הקלאסית: בלי המשפט הזה יום בלי מכירות נעלם מהגרף, והתמונה משקרת.
3. **צבעים והדגשה.** הצבע חייב לשאת משמעות (סף של 100 שקלים), לא קישוט. אומרים במפורש מי ירוק ומי אדום, אחרת המודל בוחר לבד.
4. **כותרות ותוויות.** כותרת מדויקת במירכאות. היא גם מה שהמודל מחזיר וגם מה שהקורא קורא ראשון.
5. **מסר ובהירות.** המשפט האחרון אומר למודל מה המטרה, וזה מאפשר לו להחליט על מיון, רווחים, גודל גופן ותוויות ערך בלי שנצטרך לפרט.

## תבנית למילוי

```text
1. אני [תפקיד]. קח את [קובץ / טבלה] שמכיל [מה הנתונים, על איזו תקופה] וצור [סוג גרף].
2. ציר x: [משתנה]. ציר y: [מדד]. [כלל: אל תדלג על ערכים / סדר קבוע / טווח].
3. חלק את [הסדרה] לפי [כלל חלוקה]. צבע [קבוצה א] ב-[צבע] ו-[קבוצה ב] ב-[צבע].
4. כותרת הגרף: "[כותרת מדויקת]". תוויות צירים: [x], [y].
5. המסר: הקורא צריך להבין במבט אחד [מה].
```

## רשימת בדיקה לפני שליחה

- [ ] נאמר מי אני ומה מקור הנתונים
- [ ] נבחר סוג גרף שמתאים לשאלה
- [ ] הוגדרו שני הצירים וכלל לערכים חסרים
- [ ] לכל צבע יש משמעות, והצבעים נאמרו במפורש
- [ ] הכותרת כתובה במירכאות
- [ ] נאמר מה הקורא צריך להבין
