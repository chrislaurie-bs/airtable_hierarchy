# Hierarchy

Hierarchy is an [Airtable](https://airtable.com/) custom block created out of a need I had and as an entry into the [custom block contest](https://community.airtable.com/t/new-custom-blocks-contest-with-100-000-in-prizes/30140).

Hierarchy makes it simple and intuitive to navigate a self-related table. Navigate from root to branches to eventual childless leaves and only ever see the records at one level. 

## Features

* Drill down navigation. Click on an entry in the list and it drills to the next level, showing its children as a list of clickable entries. Every time, you only see the children who has the same parent, the last entry you clicked on.
* Breadcrumb navigation. Trace the route of how you got to where you are. A bit like Hansel and Gretel. As you drill down into your self-related table, a bread crumb link to where you just clicked appears at the top - a list of branches, if you like. Eventually giving you a trace of your route. You can easily go back to a specific point in your route.
* Quick Add. Add a new entry at the current level (a sibling of the entries you see in the list) by entering a description and pressing the add button. You can configure which field in your table is the description, or it will be put the table's primary field.
* Pruning & grafting. Each row has a prune button. When pressed, this will mark that row as the graft target. A graft button appears at the top of the table allowing you to decide at what branch in your hierarchy you want to graft the pruned entry to. This makes it simple to move an entire branch with all its children to another branch.

>>> insert gif here <<<

## Roadmap
A few features I am contemplating for a future version. 
* Display configuration. Currently Hierarchy only shows the primary field of a table. This is how Airtable often do it. With this feature, you will be able to specify which fields to show on the rows/cards.
* Children lists. In some cases, Hierarchy is in fact a method to classify the parent link of another table. Add a second list of rows which then comes from the child table.
* Hierarchical roll-ups and totals. Get the counts brnaches/children or totals of a column for each node in the hierarchcy.
* Branch templates. Specify a branch node to act as a template and then graft a copy of that node at the current level. This will make it is to get identical branch structures pre-populated, based on another brnach.
* Improved settings interface. At the moment the settings interface sucks a bit.
* Code clean-up and architecture. Refactor the code into more modularized, smaller chunks. Currently index.js is a bit of a behemoth and the structure is not elegant and simple.

## The creation experience
I am new to React programming so this was a learning experience for me. Here are some thoughts on how that went.
* The forums were a friendly and helpful place. A newbie was well tolerated and answered.
* The instructions and guides were well written and understandable. 
* I would have preferred a few more examples of the api. For example, it took me a while to figure out the syntax of the fields attribute when creating or updating Airtable rows.
* My code structure is currently messy. Being a newb, I do not yet have an intuitive experience for how to architecture my custom block code. A guide of suggested architecture would be highly appreciated.
* Moving a block for development to another base proved impossible. I got the original idea for Hierarchy on a POC base I was working on to pitch to my colleagues. I soon realized that if I am going to be developing a custom block, it must happen inside a simple, dedicated test base. I could not figure out how to "move" the custom block to the new base. I kept getting a message that said you must edit the table in its original base. 
* Overall, the experience had the same, satisfying, excitement/frustration emotions of learning something new.

## Custom block / scripting functionality
What would I change or add to custom block functionality? It may well be that custom blocks can already do these things so apologies for not RTFM.
* Blocks in blocks. Have the ability to insert a custom block somewhere in your code and have that feed your new custom block. For example: Hierarchy makes intuitive navigation of a complex self-related table possible. But what if I want that to be a feeder for other functionality? I want to be able to use hierarchy as is in many places but each time using the current branch parent to feed my other functionality.
* Similarly, I could not see how to call an existing script from my code. As a programmer I would like to build a library of scripts that manipulates my data and then also be able to call those from with my custom block code.
* Allow a block to be alinking field picker. The idea is that I can export a record id from my block. Then specify the block itself as a record picker. So wh the user clicks the + button, it is my custom bock that pops up and allows the user to select the link record using cusom block.

## Airtable functionality in general.
I am an IT systems consultant / developer and my primary use for Airtable would be to help clients model the business processed in Airtable and then help them with scripting, custom blocks and even apps. There are a few things I would add / change in Airtable that would make it a better product and improve its reach.
* Record validation. Airtable is powerful in the way you can quickly create tables and links between them etc. This could however lead to dirty data quite quickly and I have a few suggestions on how the quality of the data inside an Airtable could be improved:
  * Empty or unique. This flag at the field level, that will force the user (or script / custom block) to enter a unique value (for that field in that table) or leave it blank.
  * Required. Make a field required and do not allow the user to navigate a way from a row (insert or update) unless the field has a value in it. Or else he must not be able to insert or update the row in the table
  * Turn of create new option. A select or linked field allows the user to create a new select item or even an entry in another linked table. This is powerful and is one of the things that makes Airtable unique. But occasionally you want to be able to turn that off and force the user to pick from the available list.
  * Validation by formula. Using the already existing formula system, allow me to create a formula that outputs a Boolean that indicates if the current value in the field passes validation or not. Then do not allow the update or insert into the table to happen.
  * Validation by script. Similarly, allow me to create a script that receives the current record and then returns a valid or not Boolean.
* Dynamic filtering of lookup lists. Allow me to specify a filter that is passed to the lookup list parent. One should be able to use fields in the record being edited (current value for the current row), as well as fields from the linked table in the formula.
