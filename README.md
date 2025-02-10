# Lambda Runtime
Many developers view AWS Lambda as a black box - a service where we provide code that follows a specific API interface (a handler with event and context parameters), and the Lambda service executes our code based on configured integrations. In this repository, we'll peek behind the curtain to understand how Lambda works internally.

This code repository is used by https://pashut.cloud/lambda-runtime

## Repository Structure

- `binaries/`: Contains compiled binaries required for the Lambda runtime.
- `llrt-examples/`: Contains example LLRT snippets.
  - `hello-world.mjs`: A simple "Hello World" Lambda function example.
  - `list-lambdas.mjs`: An example Lambda function that lists other Lambda functions.
- `runtime/`: Contains the core runtime code for the Lambda service.
  - `bootstrap`: The bootstrap script for initializing the Lambda runtime.
  - `runtime.mjs`: The main runtime script that handles the execution of Lambda functions.


# למדה Runtime
קופסה שחורה, מטבעה היא קופסה שלא ניתן לראות דרכה. למדה היא אחת מאותן קופסאות שחורות, שירות מדהים שמאפשר לך כמפתח לעלות במהירות לענן, כשהיא מצליחה להסתיר את המורכבות של אפליקציה שרצה בענן בצורה די מרשימה. אבל לפעמים האפשרות להרים את המכסה ולראות כיצד אותה קופסה שחורה מתקתקת יכולה לעזור להבין מדוע דברים מתנהגים כפי שהם מתנהגים  ואולי לשפר אותם עבור המקרה הפרטי שלכם.

מאגר קוד זה משמש את https://pashut.cloud/lambda-runtime

## מבנה המאגר

- `binaries/`: מכיל בינארים מקומפלים הנדרשים להרצת למדה באמצעות LLRT.
- `llrt-examples/`: מכיל דוגמאות לפונקציות LLRT.
  - `hello-world.mjs`: דוגמה פשוטה לפונקציית ״שלום עולם״.
  - `list-lambdas.mjs`: דוגמה לפונקציית LLRT שמציגה רשימה של פונקציות למדה אחרות.
- `runtime/`: מכיל את קוד הריצה המרכזי לשירות למדה.
  - `bootstrap`: סקריפט האתחול להרצת למדה.
  - `runtime.mjs`: סקריפט הריצה הראשי שמטפל בביצוע פונקציות למדה.