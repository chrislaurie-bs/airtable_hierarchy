# Hierarchy

Hierarchy is an [Airtable](https://airtable.com/) custom block created out of a need I had and as an entry into the [custom block conetst](https://community.airtable.com/t/new-custom-blocks-contest-with-100-000-in-prizes/30140).

Hierarchy makes it simple and intuitive to navigate a self related table. Navigate from root to branches to eventual childless leaves and only ever see the records at one level. 

## Features

* Drill down navigation. Click on entry in the list and it drills to the next level, showing its children as a list of clickeable entries.
* Breadcrumb trace route. of the route to where you are. A bit like Hansel and Gretel. As you drill down into your self related table, a bread crumb link to where you just cleick appears st the top. Eventually giving you a trace of how you got to where you are. You can easily go bacck tp a specifc point of your route.
* Quick Add. Add a new entry at the current level (a sibling of the entries you see in the list) by entering a description and pressinvg the add buttons. You can configure which field in your table is the description or it will be put the tables primary column.
* Pruning & grafting. Each row has aprune button. This will then mark that row as a graft tartget. A graft button appears at the top of the table allowing you to decide at what level you want to graft the original entry too. This makes it simple to move an entire branch with all itss children somewhee else.

>>> insert gif here <<<

## Roadmap
A few features I am contemplating for future version. This may not be open source though:
* Display configuration. At the moment Hoerarchy only shows the primary field of a table. This is similar to what airtabkle does. With this feature you will be able to specify which fields to show on the rows/cards.
* Children lists. In some cases your Hierarchy is in fact a method to classify the parent link to anpothe table. Add a second list of rows whihc then coms from this children table.
* Improved settings interface. AT the moment the settings interface sucks a bit.
* Code clean-up and architecture. Refactor the code into more modularised, smaller chunks. Currently index.js is a bit of a behemoth and the structire is not elegant and simple.

## The creation experience
I am new to React programmig and have only basic skills in js so this was a learning curve for me. Here are some thoughts on how that went.
* The forums was a friendly and helpful place. A newbie was well tolerated and answered.
* The instructions and guides were well written and understandable. 
* I would have preferred a few better examples of the api. For example it took me a while to figure out the syntax of the fields attribute when creating or updating airtable rows.
* My code is messy, being a newb I do not yet have an intuitive experience for how to architecture my code. A guide of suggested architecture would be  agood one.
* Debugging in javascript is already challenging for me, but the line numbers in error messages does not respond to the line numbers in my code editor.
* Moving a block to another base proved impossible. I got the original idea for Hierarchy ona POC base I was working on to pitch to my colleagues. I soon reliased that if I am going to be developing a custom block, it must happen linked to a simple dedicated test base. I could not figure out how to "move" the custom block to the new base. I kept getting a message that said you have to edit the table in it original base. 
* Overall it had the same satisfying excitement/frustration experience of learning something new.

## Custom block / scripting functionality
What would I change or add to custom block functionality? It may well be that custom blocks van already do these things so apologies for not RTFM.
* Blocks in blocks. Have the ability to insert a custom block somewhere in your code and have that feed your new custom block. For example: Hierarchy makes intuitive navigation of a complex self-related table possible. But what if I want that to be a feeder for other functionality? I want to be able to use hierarchy as is in many places but each time using the current branch parent to feed my other functionlity.
* Similarly, I could not see how to call an existing script from my code. As a programmer I would like to build a library of scripts that manipulates my data and then also be able to call thosefrom with my custom block code.

## Airtable functionality in general.
I am an IT systems consultant / developer and my primary use for Airtable would be to help clients model the business processed in Airtable and then help them with scripting, custom blocks and even apps. There a few things I would add / change in Airtable that would make it a better product and improve its reach.
* Record validation. Airtable is powerful in the way you can quickly create tables and link between them etc. This could however lead to dirty data quite quickly and I have a few suggestion on how the quality of the data inside an Airtable could be improved:
  * Empty or unique. This flag at the row level will force the user (or script / custom block) to enter a unique value (for that field in that table) or leave it blank.
  * Required. Make a field required an do not allow the user to navigate a way from a row (insert or update) unless the field has a value in it.
  * Turn of add to option. A select or linked foeld allows the user to create a new select item or even an entry in a another linked table. This is powerful and is one of the things that make Airtable unique. But, occasionally you want to be able to turn that off.
  * Validation by formula. Using the already existing formula system alow me to craete a formula that outputs a boolean that says teh current value in the field apsses validation or not.
  * Validation by script. SImilarly allow me to create a script that receives the current record and then returns a vakid or not boolean.
* Dynamic filtering of lookup lists. Allow me to specify a filter that is passed to the lookup list parent. One should be able to use fields in the record being edited (one specifc balue for these) as well as field s from the linked table in the formula.
